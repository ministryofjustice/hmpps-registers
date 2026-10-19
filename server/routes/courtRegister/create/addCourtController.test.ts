import type { Request, Response } from 'express'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import PrisonRegisterService from '../../../services/prisonRegisterService'
import AddCourtController from './addCourtController'
import { AddCourtJourney, courtSteps } from './addCourtFlowControl'

jest.mock('../../../services/prisonRegisterService')

describe('AddCourtController', () => {
  let service: jest.Mocked<PrisonRegisterService>
  let controller: AddCourtController

  const completeJourney = (): AddCourtJourney => ({
    form: {
      courtId: 'AB12',
      courtName: 'Example Magistrates Court',
      description: 'A local court',
      courtType: 'MC',
      accessibleAccess: 'ACCESSIBLE',
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
    completedSteps: [...courtSteps],
  })

  const makeRequest = (
    journeyId: string,
    step: string,
    journeys: Record<string, AddCourtJourney>,
    body: Record<string, unknown> = {},
    query: Record<string, string> = {},
  ) =>
    ({
      params: { journeyId, step },
      body,
      query,
      session: { addCourtJourneys: journeys },
      flash: jest.fn().mockReturnValue([]),
    }) as unknown as Request

  const makeResponse = () => {
    const redirect = jest.fn()
    const render = jest.fn()
    const res = { locals: { user: { username: 'test-user' } }, redirect, render } as unknown as Response
    return { res, redirect, render }
  }

  beforeEach(() => {
    jest.resetAllMocks()
    service = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new AddCourtController(service)
    service.findCourt.mockResolvedValue(undefined)
    service.getAreas.mockResolvedValue([
      { code: 'AREA1', description: 'Northern area' },
      { code: 'GEO1', description: 'Geographical north' },
    ])
    service.getRegions.mockResolvedValue([{ code: 'REGION1', description: 'Northern region' }])
    service.getLocalAuthorities.mockResolvedValue([{ code: 'AUTH1', description: 'Example authority' }])
    service.getPayrollRegions.mockResolvedValue([{ code: 'PAY1', description: 'Example payroll region' }])
    service.createCourt.mockResolvedValue({ success: true })
  })

  it('starts multiple isolated drafts without replacing existing session drafts', () => {
    const journeys: Record<string, AddCourtJourney> = {
      existing: { form: { courtId: 'OLD1' }, completedSteps: ['details'] },
    }
    const req = {
      params: {},
      session: { addCourtJourneys: journeys },
    } as unknown as Request
    const { res, redirect } = makeResponse()

    controller.start(req, res)
    controller.start(req, res)

    const ids = Object.keys(journeys)
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    expect(journeys.existing).toEqual({ form: { courtId: 'OLD1' }, completedSteps: ['details'] })
    expect(journeys[ids[1]]).toEqual({ form: {}, completedSteps: [] })
    expect(journeys[ids[2]]).toEqual({ form: {}, completedSteps: [] })
    expect(journeys[ids[1]]).not.toBe(journeys[ids[2]])
    expect(redirect).toHaveBeenNthCalledWith(1, expect.stringMatching(/^\/court-register\/create\/[^/]+\/details$/))
    expect(redirect).toHaveBeenNthCalledWith(2, expect.stringMatching(/^\/court-register\/create\/[^/]+\/details$/))
  })

  it('cancels only the selected draft and returns to the court register', () => {
    const journeys = { current: completeJourney(), other: completeJourney() }
    const req = {
      params: { journeyId: 'current' },
      session: { addCourtJourneys: journeys },
    } as unknown as Request
    const { res, redirect } = makeResponse()

    controller.cancel(req, res)

    expect(journeys).toHaveProperty('other')
    expect(journeys).not.toHaveProperty('current')
    expect(redirect).toHaveBeenCalledWith('/court-register')
  })

  it('redirects to the court register when a draft is missing for either a GET or POST', async () => {
    const { res: showResponse, redirect: showRedirect } = makeResponse()
    controller.show(makeRequest('missing', 'details', {}), showResponse)
    expect(showRedirect).toHaveBeenCalledWith('/court-register')

    const { res: submitResponse, redirect: submitRedirect } = makeResponse()
    await controller.submit(makeRequest('missing', 'details', {}), submitResponse)
    expect(submitRedirect).toHaveBeenCalledWith('/court-register')
    expect(service.findCourt).not.toHaveBeenCalled()
  })

  it('does not treat inherited properties as existing drafts for arbitrary journey IDs', () => {
    const journeys: Record<string, AddCourtJourney> = {}
    const { res, redirect } = makeResponse()

    controller.show(makeRequest('toString', 'details', journeys), res)

    expect(redirect).toHaveBeenCalledWith('/court-register')
  })

  it.each(['show', 'submit'] as const)('redirects a skipped %s request to the first incomplete step', async action => {
    const journeys: Record<string, AddCourtJourney> = { draft: { form: {}, completedSteps: [] } }
    const { res, redirect, render } = makeResponse()
    const req = makeRequest('draft', 'area', journeys)

    if (action === 'show') controller.show(req, res)
    else await controller.submit(req, res)

    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/details')
    expect(render).not.toHaveBeenCalled()
    expect(journeys.draft.completedSteps).toEqual([])
  })

  it('returns 404 for an unknown page', () => {
    const { res } = makeResponse()

    expect(() => controller.show(makeRequest('draft', 'not-a-step', { draft: completeJourney() }), res)).toThrow(
      'Court creation page not found',
    )
  })

  it('whitelists current-step input, trims it, and preserves other step answers and metadata', async () => {
    const journey = completeJourney()
    journey.form.cjitCode = 'OLD1234'
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'cjit-code', journeys, {
      cjitCode: ' NEW123 ',
      courtId: 'ATTACK',
      regionCode: 'FORGED',
      active: false,
      completedSteps: [],
    })
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(journey.form).toMatchObject({
      courtId: 'AB12',
      cjitCode: 'NEW123',
      regionCode: 'REGION1',
    })
    expect(journey.form).not.toHaveProperty('active')
    expect(journey.form).not.toHaveProperty('completedSteps')
    expect(journey.completedSteps).toEqual([...courtSteps])
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/area')
  })

  it('rejects non-string body values without storing them or advancing the journey', async () => {
    const journey: AddCourtJourney = { form: {}, completedSteps: [] }
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'details', journeys, {
      courtId: ['AB12'],
      courtName: 'Example Court',
      description: '',
    })
    const flash = jest.fn().mockReturnValue([])
    Object.assign(req, { flash })
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(flash).toHaveBeenCalledWith('errors', [{ href: '#courtId', text: 'Enter a valid value' }])
    expect(journey.form).toEqual({})
    expect(journey.completedSteps).toEqual([])
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/details')
    expect(service.findCourt).not.toHaveBeenCalled()
  })

  it('keeps validation errors in flash and leaves the corrected step incomplete', async () => {
    const journey = completeJourney()
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'details', journeys, {
      courtId: 'AB12',
      courtName: '',
      description: '',
    })
    const flash = jest.fn().mockReturnValue([])
    Object.assign(req, { flash })
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(flash).toHaveBeenCalledWith('errors', [{ href: '#courtName', text: 'Enter a court name' }])
    expect(journey.completedSteps).toEqual(courtSteps.filter(step => step !== 'details'))
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/details')

    const errors = [{ href: '#courtName', text: 'Enter a court name' }]
    const nextReq = makeRequest('draft', 'details', journeys)
    const readFlash = jest.fn().mockReturnValue(errors)
    Object.assign(nextReq, { flash: readFlash })
    const { res: nextResponse, render } = makeResponse()
    controller.show(nextReq, nextResponse)
    expect(readFlash).toHaveBeenCalledWith('errors')
    expect(render).toHaveBeenCalledWith('pages/court-register/create/step', expect.objectContaining({ errors }))
  })

  it('progresses through a valid step in order', async () => {
    const journeys: Record<string, AddCourtJourney> = { draft: { form: {}, completedSteps: [] } }
    const req = makeRequest('draft', 'details', journeys, {
      courtId: ' AB12 ',
      courtName: ' Example Court ',
      description: ' Description ',
      courtType: 'ATTACK',
      active: false,
    })
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(journeys.draft.form).toEqual({
      courtId: 'AB12',
      courtName: 'Example Court',
      description: 'Description',
    })
    expect(journeys.draft.completedSteps).toEqual(['details'])
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/court-type')
  })

  it('returns to check answers after a successful changed answer', async () => {
    const journey = completeJourney()
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'court-type', journeys, { courtType: 'CC' }, { change: 'true' })
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(journey.form.courtType).toBe('CC')
    expect(journey.completedSteps).toEqual([...courtSteps])
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/check-answers')
  })

  it('revalidates answers on check answers even when the journey claims every step is complete', async () => {
    const journey = completeJourney()
    delete journey.form.courtType
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'check-answers', journeys)
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(service.findCourt).toHaveBeenCalledWith({ username: 'test-user' }, 'AB12')
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/court-type?change=true')
    expect(journey.completedSteps).toEqual(courtSteps.filter(step => step !== 'court-type'))
    expect(service.createCourt).not.toHaveBeenCalled()
  })

  it('revalidates saved reference codes against the API before creating a court', async () => {
    const journey = completeJourney()
    journey.form.areaCode = 'STALE'
    const journeys = { draft: journey }
    const req = makeRequest('draft', 'check-answers', journeys)
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(service.getAreas).toHaveBeenCalledWith({ username: 'test-user' })
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/area?change=true')
    expect(journey.completedSteps).toEqual(courtSteps.filter(step => step !== 'area'))
    expect(service.createCourt).not.toHaveBeenCalled()
  })

  it('propagates service failures while validating and while creating a court', async () => {
    service.findCourt.mockRejectedValueOnce(new Error('Lookup failed'))
    const detailsJourney: AddCourtJourney = { form: {}, completedSteps: [] }
    await expect(
      controller.submit(
        makeRequest(
          'details-draft',
          'details',
          { 'details-draft': detailsJourney },
          {
            courtId: 'AB12',
            courtName: 'Example Court',
            description: '',
          },
        ),
        makeResponse().res,
      ),
    ).rejects.toThrow('Lookup failed')

    service.createCourt.mockRejectedValueOnce(new Error('Create failed'))
    const journeys = { draft: completeJourney() }
    await expect(
      controller.submit(makeRequest('draft', 'check-answers', journeys), makeResponse().res),
    ).rejects.toThrow('Create failed')
    expect(journeys.draft).toBeDefined()
  })

  it('retains the draft and flashes an API 400 message so submission can be retried', async () => {
    const journeys = { draft: completeJourney(), other: completeJourney() }
    service.createCourt.mockResolvedValueOnce({ success: false, userMessage: 'Court ID already exists' })
    const req = makeRequest('draft', 'check-answers', journeys)
    const { res, redirect } = makeResponse()

    await controller.submit(req, res)

    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#create-court', text: 'Court ID already exists' }])
    expect(redirect).toHaveBeenCalledWith('/court-register/create/draft/check-answers')
    expect(journeys.draft).toBeDefined()
    expect(journeys.other).toBeDefined()
  })

  it('clears only the successfully created draft and redirects to its court details', async () => {
    const journeys = { draft: completeJourney(), other: completeJourney() }
    const { res, redirect } = makeResponse()

    await controller.submit(makeRequest('draft', 'check-answers', journeys), res)

    expect(service.createCourt).toHaveBeenCalledWith(
      { username: 'test-user' },
      expect.objectContaining({ courtId: 'AB12', active: true }),
    )
    expect(journeys).not.toHaveProperty('draft')
    expect(journeys.other).toBeDefined()
    expect(redirect).toHaveBeenCalledWith('/court-register/details?id=AB12&action=CREATED')
  })
})
