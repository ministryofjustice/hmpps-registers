import type { Request, Response } from 'express'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import HMPPSAgencyRegisterApi from '../../../services/hmppsAgencyRegisterApi'
import AddPoliceCustodySuiteController from './addPoliceCustodySuiteController'
import {
  AddPoliceCustodySuiteJourney,
  canVisitPoliceCustodySuitePage,
  firstIncompleteStep,
  policeCustodySuiteNavigation,
  policeCustodySuiteSteps,
} from './addPoliceCustodySuiteFlowControl'
import addPoliceCustodySuiteMapper from './addPoliceCustodySuiteMapper'
import validatePoliceCustodySuiteStep from './addPoliceCustodySuiteValidation'
import AddPoliceCustodySuiteView from './addPoliceCustodySuiteView'

jest.mock('../../../services/hmppsAgencyRegisterApi')

const completeJourney = (): AddPoliceCustodySuiteJourney => ({
  form: {
    policeCustodySuiteId: 'AB12',
    policeCustodySuiteName: 'Example Suite',
    description: 'A suite',
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
  completedSteps: [...policeCustodySuiteSteps],
})

describe('add police custody suite flow', () => {
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
    service.createPoliceCustodySuite.mockResolvedValue({ success: true })
  })

  describe('flow control', () => {
    it('only allows visiting a page once earlier steps are complete', () => {
      const journey: AddPoliceCustodySuiteJourney = { form: {}, completedSteps: ['details'] }

      expect(canVisitPoliceCustodySuitePage(journey, 'cjit-code')).toBe(true)
      expect(canVisitPoliceCustodySuitePage(journey, 'area')).toBe(false)
      expect(canVisitPoliceCustodySuitePage(journey, 'check-answers')).toBe(false)
      expect(firstIncompleteStep(journey)).toEqual('cjit-code')
      expect(canVisitPoliceCustodySuitePage(completeJourney(), 'check-answers')).toBe(true)
    })

    it('links back and forward through the steps and returns to check answers when changing', () => {
      expect(policeCustodySuiteNavigation('j', 'details', false).backLink).toEqual('/police-custody-suite-register')
      expect(policeCustodySuiteNavigation('j', 'cjit-code', false)).toEqual({
        backLink: '/police-custody-suite-register/create/j/details',
        nextPage: '/police-custody-suite-register/create/j/area',
        cancelButton: '/police-custody-suite-register/create/j/cancel',
      })
      expect(policeCustodySuiteNavigation('j', 'payroll-region', false).nextPage).toEqual(
        '/police-custody-suite-register/create/j/check-answers',
      )
      expect(policeCustodySuiteNavigation('j', 'cjit-code', true)).toMatchObject({
        backLink: '/police-custody-suite-register/create/j/check-answers',
        nextPage: '/police-custody-suite-register/create/j/check-answers',
      })
    })
  })

  describe('mapper', () => {
    it('maps the form to the create police custody suite payload', () => {
      expect(addPoliceCustodySuiteMapper(completeJourney())).toEqual({
        policeCustodySuiteId: 'AB12',
        policeCustodySuiteName: 'Example Suite',
        description: 'A suite',
        active: true,
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

    it('omits blank optional answers', () => {
      expect(
        addPoliceCustodySuiteMapper({
          form: { policeCustodySuiteId: 'AB12', policeCustodySuiteName: 'S', cjitCode: '', areaCode: '' },
          completedSteps: [],
        }),
      ).toEqual({
        policeCustodySuiteId: 'AB12',
        policeCustodySuiteName: 'S',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      })
    })

    it('refuses an incomplete journey', () => {
      expect(() =>
        addPoliceCustodySuiteMapper({ form: { policeCustodySuiteId: 'AB12' }, completedSteps: [] }),
      ).toThrow()
    })
  })

  describe('validation', () => {
    const validate = (step: (typeof policeCustodySuiteSteps)[number], form: AddPoliceCustodySuiteJourney['form']) =>
      validatePoliceCustodySuiteStep(step, { form, completedSteps: [] }, service, context)

    it('requires a valid id and name', async () => {
      expect(await validate('details', {})).toEqual([
        { href: '#policeCustodySuiteId', text: 'Enter a police custody suite ID' },
        { href: '#policeCustodySuiteName', text: expect.any(String) },
      ])
      expect(await validate('details', { policeCustodySuiteId: 'A', policeCustodySuiteName: 'S' })).toEqual([
        { href: '#policeCustodySuiteId', text: 'Police custody suite ID must be between 2 and 6 characters' },
      ])
      expect(await validate('details', { policeCustodySuiteId: 'AB-1', policeCustodySuiteName: 'S' })).toEqual([
        { href: '#policeCustodySuiteId', text: 'Police custody suite ID must contain only letters and numbers' },
      ])
    })

    it('rejects an id already used by another agency', async () => {
      service.isAgencyIdUsed.mockResolvedValue({ agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' })

      expect(await validate('details', { policeCustodySuiteId: 'MDI', policeCustodySuiteName: 'S' })).toEqual([
        { href: '#policeCustodySuiteId', text: 'This police custody suite ID is already used by Moorland HMP' },
      ])
    })

    it('accepts valid details', async () => {
      expect(await validate('details', { policeCustodySuiteId: 'AB12', policeCustodySuiteName: 'S' })).toEqual([])
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
    it('lists answers with change links', () => {
      const { rows, title, mainDetailsRows, areaAndRegionRows } = new AddPoliceCustodySuiteView(
        'j',
        'check-answers',
        completeJourney(),
        false,
        [],
      ).renderArgs

      expect(title).toEqual('Check your answers before adding a police custody suite')
      expect(rows).toHaveLength(9)
      expect(mainDetailsRows).toHaveLength(4)
      expect(areaAndRegionRows).toHaveLength(5)
      expect(rows[3]).toMatchObject({
        key: { text: 'CJIT code' },
        value: { text: 'CJIT123' },
        actions: { items: [{ href: '/police-custody-suite-register/create/j/cjit-code?change=true' }] },
      })
    })

    it('shows Not provided for blank answers and exposes reference data for reference steps', () => {
      const args = new AddPoliceCustodySuiteView('j', 'area', { form: {}, completedSteps: [] }, false, []).renderArgs

      expect(args.rows.every(row => row.value.text === 'Not provided')).toBe(true)
      expect(args.reference).toMatchObject({ field: 'area', inputLabel: 'Area', script: 'autoCompleteArea' })
    })
  })

  describe('controller', () => {
    let controller: AddPoliceCustodySuiteController
    const redirect = jest.fn()
    const render = jest.fn()
    const res = { locals: { user: { username: 'test-user' } }, redirect, render } as unknown as Response

    const request = (
      step: string,
      journeys: Record<string, AddPoliceCustodySuiteJourney>,
      body: Record<string, unknown> = {},
      query: Record<string, string> = {},
    ) =>
      ({
        params: { journeyId: 'j', step },
        body,
        query,
        session: { addPoliceCustodySuiteJourneys: journeys },
        flash: jest.fn().mockReturnValue([]),
      }) as unknown as Request

    beforeEach(() => {
      controller = new AddPoliceCustodySuiteController(service)
    })

    it('starts a journey on the details page', () => {
      const req = { session: {} } as unknown as Request
      controller.start(req, res)

      const [journeyId] = Object.keys(req.session.addPoliceCustodySuiteJourneys)
      expect(req.session.addPoliceCustodySuiteJourneys[journeyId]).toEqual({ form: {}, completedSteps: [] })
      expect(redirect).toHaveBeenCalledWith(`/police-custody-suite-register/create/${journeyId}/details`)
    })

    it('discards the journey on cancel', () => {
      const req = request('details', { j: completeJourney() })
      controller.cancel(req, res)

      expect(req.session.addPoliceCustodySuiteJourneys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register')
    })

    it('redirects to the register when the journey is unknown and 404s on unknown pages', () => {
      controller.show(request('details', {}), res)
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register')
      expect(() => controller.show(request('nope', {}), res)).toThrow('Police custody suite creation page not found')
    })

    it('redirects to the first incomplete step when a page is visited too early', () => {
      controller.show(request('area', { j: { form: {}, completedSteps: [] } }), res)

      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register/create/j/details')
    })

    it('renders the check answers page once complete', () => {
      controller.show(request('check-answers', { j: completeJourney() }), res)

      expect(render).toHaveBeenCalledWith(
        'pages/police-custody-suite-register/create/checkAnswers',
        expect.objectContaining({ page: 'check-answers' }),
      )
    })

    it('stores a valid step and moves on, or returns to check answers when changing', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddPoliceCustodySuiteJourney }
      await controller.submit(
        request('details', journeys, { policeCustodySuiteId: ' AB12 ', policeCustodySuiteName: 'S' }),
        res,
      )

      expect(journeys.j.form).toMatchObject({
        policeCustodySuiteId: 'AB12',
        policeCustodySuiteName: 'S',
        description: '',
      })
      expect(journeys.j.completedSteps).toEqual(['details'])
      expect(redirect).toHaveBeenLastCalledWith('/police-custody-suite-register/create/j/cjit-code')

      await controller.submit(request('cjit-code', journeys, { cjitCode: 'ABC' }, { change: 'true' }), res)
      expect(redirect).toHaveBeenLastCalledWith('/police-custody-suite-register/create/j/check-answers')
    })

    it('flashes errors and un-completes the step when invalid', async () => {
      const journeys = { j: { form: {}, completedSteps: ['details'] } as AddPoliceCustodySuiteJourney }
      const req = request('cjit-code', journeys, { cjitCode: '12345678' })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [expect.objectContaining({ href: '#cjitCode' })])
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register/create/j/cjit-code')
    })

    it('rejects non-string field values', async () => {
      const journeys = { j: { form: {}, completedSteps: [] } as AddPoliceCustodySuiteJourney }
      const req = request('details', journeys, { policeCustodySuiteId: ['a', 'b'] })
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#policeCustodySuiteId', text: 'Enter a valid value' }])
      expect(service.isAgencyIdUsed).not.toHaveBeenCalled()
    })

    it('creates the police custody suite from check answers and clears the journey', async () => {
      const journeys = { j: completeJourney() }
      await controller.submit(request('check-answers', journeys), res)

      expect(service.createPoliceCustodySuite).toHaveBeenCalledWith(
        context,
        expect.objectContaining({ policeCustodySuiteId: 'AB12' }),
      )
      expect(journeys).toEqual({})
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register/details?id=AB12&action=CREATED')
    })

    it('shows the API error on check answers and keeps the journey', async () => {
      service.createPoliceCustodySuite.mockResolvedValue({ success: false, userMessage: 'Already exists' })
      const journeys = { j: completeJourney() }
      const req = request('check-answers', journeys)
      await controller.submit(req, res)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#create-police-custody-suite', text: 'Already exists' },
      ])
      expect(journeys.j).toBeDefined()
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register/create/j/check-answers')
    })

    it('sends the user back to the first invalid step instead of creating', async () => {
      const journey = completeJourney()
      journey.form.cjitCode = '12345678'
      await controller.submit(request('check-answers', { j: journey }), res)

      expect(service.createPoliceCustodySuite).not.toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/police-custody-suite-register/create/j/cjit-code?change=true')
      expect(journey.completedSteps).not.toContain('cjit-code')
    })
  })
})
