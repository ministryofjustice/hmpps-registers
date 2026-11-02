import type { Request, Response } from 'express'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import AddProbationOfficeController from './addProbationOfficeController'
import {
  AddProbationOfficeJourney,
  canVisitProbationOfficePage,
  firstIncompleteStep,
  probationOfficeNavigation,
  probationOfficeSteps,
} from './addProbationOfficeFlowControl'
import addProbationOfficeMapper from './addProbationOfficeMapper'
import validateProbationOfficeStep from './addProbationOfficeValidation'
import AddProbationOfficeView from './addProbationOfficeView'

jest.mock('../../../services/hmppsAgencyRegisterApi')

const completeJourney = (): AddProbationOfficeJourney => ({
  form: {
    probationOfficeId: 'AB12',
    probationOfficeName: 'Example Suite',
    description: 'A suite',
    contact: 'Duty Officer',
    cjitCode: 'CJIT123',
    accessibleAccess: 'WHEELCHAIR_ACCESS',
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
  completedSteps: [...probationOfficeSteps],
})

describe('add probation office flow', () => {
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
    service.createProbationOffice.mockResolvedValue({ success: true })
  })

  describe('flow control', () => {
    it('only allows visiting a page once earlier steps are complete', () => {
      const journey: AddProbationOfficeJourney = { form: {}, completedSteps: ['details'] }

      expect(canVisitProbationOfficePage(journey, 'cjit-code')).toBe(true)
      expect(canVisitProbationOfficePage(journey, 'area')).toBe(false)
      expect(canVisitProbationOfficePage(journey, 'check-answers')).toBe(false)
      expect(firstIncompleteStep(journey)).toEqual('cjit-code')
      expect(canVisitProbationOfficePage(completeJourney(), 'check-answers')).toBe(true)
    })

    it('links back and forward through the steps and returns to check answers when changing', () => {
      expect(probationOfficeNavigation('j', 'details', false).backLink).toEqual('/probation-office-register')
      expect(probationOfficeNavigation('j', 'cjit-code', false)).toEqual({
        backLink: '/probation-office-register/create/j/details',
        nextPage: '/probation-office-register/create/j/accessible-access',
        cancelButton: '/probation-office-register/create/j/cancel',
      })
      expect(probationOfficeNavigation('j', 'payroll-region', false).nextPage).toEqual(
        '/probation-office-register/create/j/check-answers',
      )
      expect(probationOfficeNavigation('j', 'cjit-code', true)).toMatchObject({
        backLink: '/probation-office-register/create/j/check-answers',
        nextPage: '/probation-office-register/create/j/check-answers',
      })
    })
  })

  describe('mapper', () => {
    it('maps the form to the create probation office payload', () => {
      expect(addProbationOfficeMapper(completeJourney())).toEqual({
        probationOfficeId: 'AB12',
        probationOfficeName: 'Example Suite',
        description: 'A suite',
        contact: 'Duty Officer',
        active: true,
        accessibleAccess: 'WHEELCHAIR_ACCESS',
        cjitCode: 'CJIT123',
        areaCode: 'AREA1',
        regionCode: 'REGION1',
        geographicalAreaCode: 'GEO1',
        localAuthorityCode: 'AUTH1',
        payrollRegionCode: 'PAY1',
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      })
    })

    it('omits accessible access when unknown is selected', () => {
      expect(
        addProbationOfficeMapper({
          form: { probationOfficeId: 'AB12', probationOfficeName: 'S', accessibleAccess: 'UNKNOWN' },
          completedSteps: [],
        }),
      ).not.toHaveProperty('accessibleAccess', expect.anything())
    })

    it('omits blank optional answers', () => {
      expect(
        addProbationOfficeMapper({
          form: { probationOfficeId: 'AB12', probationOfficeName: 'S', cjitCode: '', areaCode: '' },
          completedSteps: [],
        }),
      ).toEqual({
        probationOfficeId: 'AB12',
        probationOfficeName: 'S',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      })
    })

    it('refuses an incomplete journey', () => {
      expect(() => addProbationOfficeMapper({ form: { probationOfficeId: 'AB12' }, completedSteps: [] })).toThrow()
    })
  })

  describe('validation', () => {
    const validate = (step: (typeof probationOfficeSteps)[number], form: AddProbationOfficeJourney['form']) =>
      validateProbationOfficeStep(step, { form, completedSteps: [] }, service, context)

    it('requires a valid id and name', async () => {
      expect(await validate('details', {})).toEqual([
        { href: '#probationOfficeId', text: 'Enter a probation office ID' },
        { href: '#probationOfficeName', text: expect.any(String) },
      ])
      expect(await validate('details', { probationOfficeId: 'A', probationOfficeName: 'S' })).toEqual([
        { href: '#probationOfficeId', text: 'Probation office ID must be between 2 and 6 characters' },
      ])
      expect(await validate('details', { probationOfficeId: 'AB-1', probationOfficeName: 'S' })).toEqual([
        { href: '#probationOfficeId', text: 'Probation office ID must contain only letters and numbers' },
      ])
    })

    it('rejects an id already used by another agency', async () => {
      service.isAgencyIdUsed.mockResolvedValue({ agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' })

      expect(await validate('details', { probationOfficeId: 'MDI', probationOfficeName: 'S' })).toEqual([
        { href: '#probationOfficeId', text: 'This probation office ID is already used by Moorland HMP' },
      ])
    })

    it('accepts valid details', async () => {
      expect(await validate('details', { probationOfficeId: 'AB12', probationOfficeName: 'S' })).toEqual([])
    })

    it('limits the CJIT code to 7 characters', async () => {
      expect(await validate('accessible-access', { accessibleAccess: 'ACCESSIBLE' })).toEqual([])
      expect(await validate('accessible-access', { accessibleAccess: 'UNKNOWN' })).toEqual([])
      expect(await validate('accessible-access', { accessibleAccess: 'BOGUS' })).toHaveLength(1)
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
    it('lists answers with change links', () => {
      const { rows, title, mainDetailsRows, areaAndRegionRows } = new AddProbationOfficeView(
        'j',
        'check-answers',
        completeJourney(),
        false,
        [],
      ).renderArgs

      expect(title).toEqual('Check your answers before adding a probation office')
      expect(rows).toHaveLength(11)
      expect(mainDetailsRows).toHaveLength(6)
      expect(areaAndRegionRows).toHaveLength(5)
      expect(rows[4]).toMatchObject({
        key: { text: 'CJIT code' },
        value: { text: 'CJIT123' },
        actions: { items: [{ href: '/probation-office-register/create/j/cjit-code?change=true' }] },
      })
    })

    it('shows Not provided for blank answers and exposes reference data for reference steps', () => {
      const args = new AddProbationOfficeView('j', 'area', { form: {}, completedSteps: [] }, false, []).renderArgs

      expect(args.rows.every(row => row.value.text === 'Not provided')).toBe(true)
      expect(args.reference).toMatchObject({ field: 'area', inputLabel: 'Area', script: 'autoCompleteArea' })
    })
  })

  describe('controller', () => {
    let controller: AddProbationOfficeController
    const redirect = jest.fn()
    const render = jest.fn()
    const res = { locals: { user: { username: 'test-user' } }, redirect, render } as unknown as Response

    const request = (
      step: string,
      journeys: Record<string, AddProbationOfficeJourney>,
      body: Record<string, unknown> = {},
      query: Record<string, string> = {},
    ) =>
      ({
        params: { journeyId: 'j', step },
        body,
        query,
        session: { addProbationOfficeJourneys: journeys },
        flash: jest.fn().mockReturnValue([]),
      }) as unknown as Request

    beforeEach(() => {
      controller = new AddProbationOfficeController(service)
    })

    it('starts a journey on the details page', () => {
      const req = { session: {} } as unknown as Request
      controller.start(req, res)

      const [journeyId] = Object.keys(req.session.addProbationOfficeJourneys)
      expect(req.session.addProbationOfficeJourneys[journeyId]).toEqual({ form: {}, completedSteps: [] })
      expect(redirect).toHaveBeenCalledWith(`/probation-office-register/create/${journeyId}/details`)
    })

    it('discards the journey on cancel', () => {
      const req = request('details', { j: completeJourney() })
      controller.cancel(req, res)

      expect(req.session.addProbationOfficeJourneys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/probation-office-register')
    })

    it('redirects to the register when the journey is unknown and 404s on unknown pages', () => {
      controller.show(request('details', {}), res)
      expect(redirect).toHaveBeenCalledWith('/probation-office-register')
      expect(() => controller.show(request('nope', {}), res)).toThrow('Probation office creation page not found')
    })

    it('redirects to the first incomplete step when a page is visited too early', () => {
      controller.show(request('area', { j: { form: {}, completedSteps: [] } }), res)

      expect(redirect).toHaveBeenCalledWith('/probation-office-register/create/j/details')
    })

    it('renders the check answers page once complete', () => {
      controller.show(request('check-answers', { j: completeJourney() }), res)

      expect(render).toHaveBeenCalledWith(
        'pages/probation-office-register/create/checkAnswers',
        expect.objectContaining({ page: 'check-answers' }),
      )
    })

    it('stores a valid step and moves on, or returns to check answers when changing', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddProbationOfficeJourney }
      await controller.submit(
        request('details', journeys, { probationOfficeId: ' AB12 ', probationOfficeName: 'S' }),
        res,
      )

      expect(journeys.j.form).toMatchObject({
        probationOfficeId: 'AB12',
        probationOfficeName: 'S',
        description: '',
      })
      expect(journeys.j.completedSteps).toEqual(['details'])
      expect(redirect).toHaveBeenLastCalledWith('/probation-office-register/create/j/cjit-code')

      await controller.submit(request('cjit-code', journeys, { cjitCode: 'ABC' }, { change: 'true' }), res)
      expect(redirect).toHaveBeenLastCalledWith('/probation-office-register/create/j/check-answers')
    })

    it('flashes errors and un-completes the step when invalid', async () => {
      const journeys = { j: { form: {}, completedSteps: ['details'] } as AddProbationOfficeJourney }
      const req = request('cjit-code', journeys, { cjitCode: '12345678' })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#cjitCode' })])
      expect(redirect).toHaveBeenCalledWith('/probation-office-register/create/j/cjit-code')
    })

    it('rejects non-string field values', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddProbationOfficeJourney }
      const req = request('details', journeys, { probationOfficeId: ['a', 'b'] })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#probationOfficeId', text: 'Enter a valid value' }])
      expect(service.isAgencyIdUsed).not.toHaveBeenCalled()
    })

    it('creates the probation office from check answers and clears the journey', async () => {
      const journeys = { j: completeJourney() }
      await controller.submit(request('check-answers', journeys), res)

      expect(service.createProbationOffice).toHaveBeenCalledWith(
        context,
        expect.objectContaining({ probationOfficeId: 'AB12' }),
      )
      expect(journeys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/probation-office-register/details?id=AB12&action=CREATED')
    })

    it('shows the API error on check answers and keeps the journey', async () => {
      service.createProbationOffice.mockResolvedValue({ success: false, userMessage: 'Already exists' })
      const journeys = { j: completeJourney() }
      const req = request('check-answers', journeys)
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#create-probation-office', text: 'Already exists' }])
      expect(journeys.j).toBeDefined()
      expect(redirect).toHaveBeenCalledWith('/probation-office-register/create/j/check-answers')
    })

    it('sends the user back to the first invalid step instead of creating', async () => {
      const journey = completeJourney()
      journey.form.cjitCode = '12345678'
      await controller.submit(request('check-answers', { j: journey }), res)

      expect(service.createProbationOffice).not.toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/probation-office-register/create/j/cjit-code?change=true')
      expect(journey.completedSteps).not.toContain('cjit-code')
    })
  })
})
