import type { Request, Response } from 'express'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import AddOtherAgencyController from './addOtherAgencyController'
import {
  AddOtherAgencyJourney,
  canVisitOtherAgencyPage,
  firstIncompleteStep,
  otherAgencyNavigation,
  otherAgencySteps,
} from './addOtherAgencyFlowControl'
import addOtherAgencyMapper from './addOtherAgencyMapper'
import validateOtherAgencyStep from './addOtherAgencyValidation'
import AddOtherAgencyView from './addOtherAgencyView'

jest.mock('../../../services/hmppsAgencyRegisterApi')

const completeJourney = (): AddOtherAgencyJourney => ({
  form: {
    agencyId: 'AB12',
    agencyName: 'Example Premises',
    description: 'A premises',
    agencyType: 'PECS',
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
  completedSteps: [...otherAgencySteps],
})

describe('add other agency flow', () => {
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
    service.createOtherAgency.mockResolvedValue({ success: true })
  })

  describe('flow control', () => {
    it('only allows visiting a page once earlier steps are complete', () => {
      const journey: AddOtherAgencyJourney = { form: {}, completedSteps: ['details'] }

      expect(canVisitOtherAgencyPage(journey, 'agency-type')).toBe(true)
      expect(canVisitOtherAgencyPage(journey, 'cjit-code')).toBe(false)
      expect(canVisitOtherAgencyPage(journey, 'area')).toBe(false)
      expect(canVisitOtherAgencyPage(journey, 'check-answers')).toBe(false)
      expect(firstIncompleteStep(journey)).toEqual('agency-type')
      expect(canVisitOtherAgencyPage(completeJourney(), 'check-answers')).toBe(true)
    })

    it('links back and forward through the steps and returns to check answers when changing', () => {
      expect(otherAgencyNavigation('j', 'details', false).backLink).toEqual('/other-agency-register')
      expect(otherAgencyNavigation('j', 'agency-type', false)).toEqual({
        backLink: '/other-agency-register/create/j/details',
        nextPage: '/other-agency-register/create/j/cjit-code',
        cancelButton: '/other-agency-register/create/j/cancel',
      })
      expect(otherAgencyNavigation('j', 'payroll-region', false).nextPage).toEqual(
        '/other-agency-register/create/j/check-answers',
      )
      expect(otherAgencyNavigation('j', 'cjit-code', true)).toMatchObject({
        backLink: '/other-agency-register/create/j/check-answers',
        nextPage: '/other-agency-register/create/j/check-answers',
      })
    })
  })

  describe('mapper', () => {
    it('maps the form to the create other agency payload', () => {
      expect(addOtherAgencyMapper(completeJourney())).toEqual({
        agencyId: 'AB12',
        agencyName: 'Example Premises',
        description: 'A premises',
        otherAgencyType: 'PECS',
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
        addOtherAgencyMapper({
          form: { agencyId: 'AB12', agencyName: 'S', agencyType: 'PECS', accessibleAccess: 'UNKNOWN' },
          completedSteps: [],
        }),
      ).not.toHaveProperty('accessibleAccess', expect.anything())
    })

    it('omits blank optional answers', () => {
      expect(
        addOtherAgencyMapper({
          form: { agencyId: 'AB12', agencyName: 'S', agencyType: 'PECS', cjitCode: '', areaCode: '' },
          completedSteps: [],
        }),
      ).toEqual({
        agencyId: 'AB12',
        agencyName: 'S',
        otherAgencyType: 'PECS',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      })
    })

    it('refuses an incomplete journey', () => {
      expect(() => addOtherAgencyMapper({ form: { agencyId: 'AB12' }, completedSteps: [] })).toThrow()
    })
  })

  describe('validation', () => {
    const validate = (step: (typeof otherAgencySteps)[number], form: AddOtherAgencyJourney['form']) =>
      validateOtherAgencyStep(step, { form, completedSteps: [] }, service, context)

    it('requires a valid id and name', async () => {
      expect(await validate('details', {})).toEqual([
        { href: '#agencyId', text: 'Enter an agency ID' },
        { href: '#agencyName', text: expect.any(String) },
      ])
      expect(await validate('details', { agencyId: 'A', agencyName: 'S' })).toEqual([
        { href: '#agencyId', text: 'Agency ID must be between 2 and 6 characters' },
      ])
      expect(await validate('details', { agencyId: 'AB-1', agencyName: 'S' })).toEqual([
        { href: '#agencyId', text: 'Agency ID must contain only letters and numbers' },
      ])
    })

    it('rejects an id already used by another agency', async () => {
      service.isAgencyIdUsed.mockResolvedValue({ agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' })

      expect(await validate('details', { agencyId: 'MDI', agencyName: 'S' })).toEqual([
        { href: '#agencyId', text: 'This agency ID is already used by Moorland HMP' },
      ])
    })

    it('requires a known agency type', async () => {
      expect(await validate('agency-type', {})).toEqual([{ href: '#agencyType', text: 'Select an agency type' }])
      expect(await validate('agency-type', { agencyType: 'NOPE' })).toHaveLength(1)
      expect(await validate('agency-type', { agencyType: 'AIRPORT' })).toEqual([])
    })

    it('accepts valid details', async () => {
      expect(await validate('details', { agencyId: 'AB12', agencyName: 'S' })).toEqual([])
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
      const { rows, title, mainDetailsRows, areaAndRegionRows } = new AddOtherAgencyView(
        'j',
        'check-answers',
        completeJourney(),
        false,
        [],
      ).renderArgs

      expect(title).toEqual('Check your answers before adding an other agency')
      expect(rows).toHaveLength(11)
      expect(mainDetailsRows).toHaveLength(6)
      expect(areaAndRegionRows).toHaveLength(5)
      expect(rows[4]).toMatchObject({
        key: { text: 'CJIT code' },
        value: { text: 'CJIT123' },
        actions: { items: [{ href: '/other-agency-register/create/j/cjit-code?change=true' }] },
      })
    })

    it('shows Not provided for blank answers and exposes reference data for reference steps', () => {
      const args = new AddOtherAgencyView('j', 'area', { form: {}, completedSteps: [] }, false, []).renderArgs

      expect(args.rows.every(row => row.value.text === 'Not provided')).toBe(true)
      expect(args.reference).toMatchObject({ field: 'area', inputLabel: 'Area', script: 'autoCompleteArea' })
    })
  })

  describe('controller', () => {
    let controller: AddOtherAgencyController
    const redirect = jest.fn()
    const render = jest.fn()
    const res = { locals: { user: { username: 'test-user' } }, redirect, render } as unknown as Response

    const request = (
      step: string,
      journeys: Record<string, AddOtherAgencyJourney>,
      body: Record<string, unknown> = {},
      query: Record<string, string> = {},
    ) =>
      ({
        params: { journeyId: 'j', step },
        body,
        query,
        session: { addOtherAgencyJourneys: journeys },
        flash: jest.fn().mockReturnValue([]),
      }) as unknown as Request

    beforeEach(() => {
      controller = new AddOtherAgencyController(service)
    })

    it('starts a journey on the details page', () => {
      const req = { session: {} } as unknown as Request
      controller.start(req, res)

      const [journeyId] = Object.keys(req.session.addOtherAgencyJourneys)
      expect(req.session.addOtherAgencyJourneys[journeyId]).toEqual({ form: {}, completedSteps: [] })
      expect(redirect).toHaveBeenCalledWith(`/other-agency-register/create/${journeyId}/details`)
    })

    it('discards the journey on cancel', () => {
      const req = request('details', { j: completeJourney() })
      controller.cancel(req, res)

      expect(req.session.addOtherAgencyJourneys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/other-agency-register')
    })

    it('redirects to the register when the journey is unknown and 404s on unknown pages', () => {
      controller.show(request('details', {}), res)
      expect(redirect).toHaveBeenCalledWith('/other-agency-register')
      expect(() => controller.show(request('nope', {}), res)).toThrow('Other agency creation page not found')
    })

    it('redirects to the first incomplete step when a page is visited too early', () => {
      controller.show(request('area', { j: { form: {}, completedSteps: [] } }), res)

      expect(redirect).toHaveBeenCalledWith('/other-agency-register/create/j/details')
    })

    it('renders the check answers page once complete', () => {
      controller.show(request('check-answers', { j: completeJourney() }), res)

      expect(render).toHaveBeenCalledWith(
        'pages/other-agency-register/create/checkAnswers',
        expect.objectContaining({ page: 'check-answers' }),
      )
    })

    it('stores a valid step and moves on, or returns to check answers when changing', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddOtherAgencyJourney }
      await controller.submit(request('details', journeys, { agencyId: ' AB12 ', agencyName: 'S' }), res)

      expect(journeys.j.form).toMatchObject({
        agencyId: 'AB12',
        agencyName: 'S',
        description: '',
      })
      expect(journeys.j.completedSteps).toEqual(['details'])
      expect(redirect).toHaveBeenLastCalledWith('/other-agency-register/create/j/agency-type')

      await controller.submit(request('agency-type', journeys, { agencyType: 'PECS' }, { change: 'true' }), res)
      expect(redirect).toHaveBeenLastCalledWith('/other-agency-register/create/j/check-answers')
    })

    it('flashes errors and un-completes the step when invalid', async () => {
      const journeys = { j: { form: {}, completedSteps: ['details', 'agency-type'] } as AddOtherAgencyJourney }
      const req = request('cjit-code', journeys, { cjitCode: '12345678' })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#cjitCode' })])
      expect(redirect).toHaveBeenCalledWith('/other-agency-register/create/j/cjit-code')
    })

    it('rejects non-string field values', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddOtherAgencyJourney }
      const req = request('details', journeys, { agencyId: ['a', 'b'] })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#agencyId', text: 'Enter a valid value' }])
      expect(service.isAgencyIdUsed).not.toHaveBeenCalled()
    })

    it('creates the other agency from check answers and clears the journey', async () => {
      const journeys = { j: completeJourney() }
      await controller.submit(request('check-answers', journeys), res)

      expect(service.createOtherAgency).toHaveBeenCalledWith(context, expect.objectContaining({ agencyId: 'AB12' }))
      expect(journeys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/other-agency-register/details?id=AB12&action=CREATED')
    })

    it('shows the API error on check answers and keeps the journey', async () => {
      service.createOtherAgency.mockResolvedValue({ success: false, userMessage: 'Already exists' })
      const journeys = { j: completeJourney() }
      const req = request('check-answers', journeys)
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#create-other-agency', text: 'Already exists' }])
      expect(journeys.j).toBeDefined()
      expect(redirect).toHaveBeenCalledWith('/other-agency-register/create/j/check-answers')
    })

    it('sends the user back to the first invalid step instead of creating', async () => {
      const journey = completeJourney()
      journey.form.cjitCode = '12345678'
      await controller.submit(request('check-answers', { j: journey }), res)

      expect(service.createOtherAgency).not.toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/other-agency-register/create/j/cjit-code?change=true')
      expect(journey.completedSteps).not.toContain('cjit-code')
    })
  })
})
