import type { Request, Response } from 'express'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import AddHospitalController from './addHospitalController'
import {
  AddHospitalJourney,
  canVisitHospitalPage,
  firstIncompleteStep,
  hospitalNavigation,
  hospitalSteps,
} from './addHospitalFlowControl'
import addHospitalMapper from './addHospitalMapper'
import validateHospitalStep from './addHospitalValidation'
import AddHospitalView from './addHospitalView'

jest.mock('../../../services/hmppsAgencyRegisterApi')

const completeJourney = (): AddHospitalJourney => ({
  form: {
    hospitalId: 'AB12',
    hospitalName: 'Example Hospital',
    description: 'A hospital',
    highSecurity: 'true',
    cjitCode: 'CJIT123',
    areaCode: 'AREA1',
    areaDescription: 'Northern area',
    regionCode: 'REGION1',
    regionDescription: 'Northern region',
    geographicalAreaCode: 'GEO1',
    geographicalAreaDescription: 'Geographical north',
    localAuthorityCode: 'AUTH1',
    localAuthorityDescription: 'Example authority',
    payrollRegionCode: 'PAY1',
    payrollRegionDescription: 'Example payroll region',
  },
  completedSteps: [...hospitalSteps],
})

describe('add hospital flow', () => {
  let service: jest.Mocked<HMPPSAgencyRegisterApi>
  const context = { username: 'test-user' }

  beforeEach(() => {
    jest.resetAllMocks()
    service = new HMPPSAgencyRegisterApi({} as HmppsAuthClient) as jest.Mocked<HMPPSAgencyRegisterApi>
    service.isAgencyIdUsed.mockResolvedValue(undefined)
    service.getAreas.mockResolvedValue([
      { code: 'AREA1', description: 'Northern area' },
      { code: 'GEO1', description: 'Geographical north' },
    ])
    service.getRegions.mockResolvedValue([{ code: 'REGION1', description: 'Northern region' }])
    service.getLocalAuthorities.mockResolvedValue([{ code: 'AUTH1', description: 'Example authority' }])
    service.getPayrollRegions.mockResolvedValue([{ code: 'PAY1', description: 'Example payroll region' }])
    service.createHospital.mockResolvedValue({ success: true })
  })

  describe('flow control', () => {
    it('only allows visiting a page once earlier steps are complete', () => {
      const journey: AddHospitalJourney = { form: {}, completedSteps: ['details'] }

      expect(canVisitHospitalPage(journey, 'high-security')).toBe(true)
      expect(canVisitHospitalPage(journey, 'cjit-code')).toBe(false)
      expect(canVisitHospitalPage(journey, 'check-answers')).toBe(false)
      expect(firstIncompleteStep(journey)).toEqual('high-security')
      expect(canVisitHospitalPage(completeJourney(), 'check-answers')).toBe(true)
    })

    it('links back and forward through the steps and returns to check answers when changing', () => {
      expect(hospitalNavigation('j', 'details', false).backLink).toEqual('/hospital-register')
      expect(hospitalNavigation('j', 'high-security', false)).toEqual({
        backLink: '/hospital-register/create/j/details',
        nextPage: '/hospital-register/create/j/cjit-code',
        cancelButton: '/hospital-register/create/j/cancel',
      })
      expect(hospitalNavigation('j', 'payroll-region', false).nextPage).toEqual(
        '/hospital-register/create/j/check-answers',
      )
      expect(hospitalNavigation('j', 'cjit-code', true)).toMatchObject({
        backLink: '/hospital-register/create/j/check-answers',
        nextPage: '/hospital-register/create/j/check-answers',
      })
    })
  })

  describe('mapper', () => {
    it('maps the form to the create hospital payload', () => {
      expect(addHospitalMapper(completeJourney())).toEqual({
        hospitalId: 'AB12',
        hospitalName: 'Example Hospital',
        description: 'A hospital',
        active: true,
        highSecurity: true,
        cjitCode: 'CJIT123',
        areaCode: 'AREA1',
        regionCode: 'REGION1',
        geographicalAreaCode: 'GEO1',
        localAuthorityCode: 'AUTH1',
        payrollRegionCode: 'PAY1',
        addresses: [],
        phoneNumbers: [],
      })
    })

    it('omits blank optional answers and maps No to false', () => {
      const mapped = addHospitalMapper({
        form: { hospitalId: 'AB12', hospitalName: 'H', highSecurity: 'false', cjitCode: '', areaCode: '' },
        completedSteps: [],
      })

      expect(mapped).toEqual({
        hospitalId: 'AB12',
        hospitalName: 'H',
        active: true,
        highSecurity: false,
        addresses: [],
        phoneNumbers: [],
      })
    })

    it('refuses an incomplete journey', () => {
      expect(() => addHospitalMapper({ form: { hospitalId: 'AB12' }, completedSteps: [] })).toThrow()
    })
  })

  describe('validation', () => {
    const validate = (step: (typeof hospitalSteps)[number], form: AddHospitalJourney['form']) =>
      validateHospitalStep(step, { form, completedSteps: [] }, service, context)

    it('requires a valid hospital id and name', async () => {
      expect(await validate('details', {})).toEqual([
        { href: '#hospitalId', text: 'Enter a hospital ID' },
        { href: '#hospitalName', text: expect.any(String) },
      ])
      expect(await validate('details', { hospitalId: 'A', hospitalName: 'H' })).toEqual([
        { href: '#hospitalId', text: 'Hospital ID must be between 2 and 6 characters' },
      ])
      expect(await validate('details', { hospitalId: 'AB-1', hospitalName: 'H' })).toEqual([
        { href: '#hospitalId', text: 'Hospital ID must contain only letters and numbers' },
      ])
    })

    it('rejects an id already used by another agency', async () => {
      service.isAgencyIdUsed.mockResolvedValue({ agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' })

      expect(await validate('details', { hospitalId: 'MDI', hospitalName: 'H' })).toEqual([
        { href: '#hospitalId', text: 'This hospital ID is already used by Moorland HMP' },
      ])
    })

    it('accepts valid details', async () => {
      expect(await validate('details', { hospitalId: 'AB12', hospitalName: 'H' })).toEqual([])
    })

    it.each([
      ['true', 0],
      ['false', 0],
      [undefined, 1],
      ['maybe', 1],
    ])('validates high security %p', async (highSecurity, errorCount) => {
      expect(await validate('high-security', { highSecurity })).toHaveLength(errorCount)
    })

    it('limits the CJIT code to 7 characters', async () => {
      expect(await validate('cjit-code', { cjitCode: '1234567' })).toEqual([])
      expect(await validate('cjit-code', { cjitCode: '12345678' })).toHaveLength(1)
    })

    it('accepts a known reference code, fills its description and rejects unselected text', async () => {
      const form = { areaCode: 'AREA1', areaDescription: 'x' }
      expect(await validate('area', form)).toEqual([])
      expect(form.areaDescription).toEqual('Northern area')
      expect(await validate('area', { areaCode: '', areaDescription: 'Nowhere' })).toEqual([
        { href: '#area', text: 'Select a valid area from the suggestions' },
      ])
      expect(await validate('region', {})).toEqual([])
    })
  })

  describe('view', () => {
    it('lists answers with change links and shows high security as Yes/No', () => {
      const { rows, title, mainDetailsRows, areaAndRegionRows } = new AddHospitalView(
        'j',
        'check-answers',
        completeJourney(),
        false,
        [],
      ).renderArgs

      expect(title).toEqual('Check your answers before adding a hospital')
      expect(rows).toHaveLength(10)
      expect(mainDetailsRows).toHaveLength(5)
      expect(areaAndRegionRows).toHaveLength(5)
      expect(rows[3]).toMatchObject({
        key: { text: 'High security' },
        value: { text: 'Yes' },
        actions: { items: [{ href: '/hospital-register/create/j/high-security?change=true' }] },
      })
    })

    it('shows Not provided for blank answers and exposes reference data for reference steps', () => {
      const args = new AddHospitalView('j', 'area', { form: {}, completedSteps: [] }, false, []).renderArgs

      expect(args.rows.every(row => row.value.text === 'Not provided')).toBe(true)
      expect(args.reference).toMatchObject({ field: 'area', inputLabel: 'Area', script: 'autoCompleteArea' })
    })
  })

  describe('controller', () => {
    let controller: AddHospitalController
    const redirect = jest.fn()
    const render = jest.fn()
    const res = { locals: { user: { username: 'test-user' } }, redirect, render } as unknown as Response

    const request = (
      step: string,
      journeys: Record<string, AddHospitalJourney>,
      body: Record<string, unknown> = {},
      query: Record<string, string> = {},
    ) =>
      ({
        params: { journeyId: 'j', step },
        body,
        query,
        session: { addHospitalJourneys: journeys },
        flash: jest.fn().mockReturnValue([]),
      }) as unknown as Request

    beforeEach(() => {
      controller = new AddHospitalController(service)
    })

    it('starts a journey on the details page', () => {
      const req = { session: {} } as unknown as Request
      controller.start(req, res)

      const [journeyId] = Object.keys(req.session.addHospitalJourneys)
      expect(req.session.addHospitalJourneys[journeyId]).toEqual({ form: {}, completedSteps: [] })
      expect(redirect).toHaveBeenCalledWith(`/hospital-register/create/${journeyId}/details`)
    })

    it('discards the journey on cancel', () => {
      const req = request('details', { j: completeJourney() })
      req.params.journeyId = 'j'
      controller.cancel(req, res)

      expect(req.session.addHospitalJourneys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/hospital-register')
    })

    it('redirects to the register when the journey is unknown and 404s on unknown pages', () => {
      controller.show(request('details', {}), res)
      expect(redirect).toHaveBeenCalledWith('/hospital-register')
      expect(() => controller.show(request('nope', {}), res)).toThrow('Hospital creation page not found')
    })

    it('redirects to the first incomplete step when a page is visited too early', () => {
      controller.show(request('cjit-code', { j: { form: {}, completedSteps: [] } }), res)

      expect(redirect).toHaveBeenCalledWith('/hospital-register/create/j/details')
    })

    it('stores a valid step and moves on, or returns to check answers when changing', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddHospitalJourney }
      await controller.submit(request('details', journeys, { hospitalId: ' AB12 ', hospitalName: 'H' }), res)

      expect(journeys.j.form).toMatchObject({ hospitalId: 'AB12', hospitalName: 'H', description: '' })
      expect(journeys.j.completedSteps).toEqual(['details'])
      expect(redirect).toHaveBeenLastCalledWith('/hospital-register/create/j/high-security')

      await controller.submit(request('high-security', journeys, { highSecurity: 'false' }, { change: 'true' }), res)
      expect(redirect).toHaveBeenLastCalledWith('/hospital-register/create/j/check-answers')
    })

    it('flashes errors and un-completes the step when invalid', async () => {
      const journeys = { j: { form: {}, completedSteps: ['details'] } as AddHospitalJourney }
      const req = request('high-security', journeys, {})
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#highSecurity' })])
      expect(redirect).toHaveBeenCalledWith('/hospital-register/create/j/high-security')
    })

    it('rejects non-string field values', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddHospitalJourney }
      const req = request('details', journeys, { hospitalId: ['a', 'b'] })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#hospitalId', text: 'Enter a valid value' }])
      expect(service.isAgencyIdUsed).not.toHaveBeenCalled()
    })

    it('creates the hospital from check answers and clears the journey', async () => {
      const journeys = { j: completeJourney() }
      await controller.submit(request('check-answers', journeys), res)

      expect(service.createHospital).toHaveBeenCalledWith(context, expect.objectContaining({ hospitalId: 'AB12' }))
      expect(journeys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/hospital-register/details?id=AB12&action=CREATED')
    })

    it('shows the API error on check answers and keeps the journey', async () => {
      service.createHospital.mockResolvedValue({ success: false, userMessage: 'Already exists' })
      const journeys = { j: completeJourney() }
      const req = request('check-answers', journeys)
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#create-hospital', text: 'Already exists' }])
      expect(journeys.j).toBeDefined()
      expect(redirect).toHaveBeenCalledWith('/hospital-register/create/j/check-answers')
    })

    it('sends the user back to the first invalid step instead of creating', async () => {
      const journey = completeJourney()
      journey.form.cjitCode = '12345678'
      await controller.submit(request('check-answers', { j: journey }), res)

      expect(service.createHospital).not.toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/hospital-register/create/j/cjit-code?change=true')
      expect(journey.completedSteps).not.toContain('cjit-code')
    })
  })
})
