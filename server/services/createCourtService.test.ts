import nock from 'nock'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import HmppsAuthClient from '../data/hmppsAuthClient'
import TokenStore from '../data/tokenStore/redisTokenStore'
import config from '../config'
import { CreateCourt } from '../@types/prisonRegister'
import courtData from '../routes/testutils/mockCourtData'

jest.mock('../data/hmppsAuthClient')

describe('Court creation API', () => {
  let auth: jest.Mocked<HmppsAuthClient>
  let service: HMPPSAgencyRegisterApi
  const court: CreateCourt = {
    courtId: 'NEWCC',
    courtName: 'New Crown Court',
    active: true,
    courtTypeCode: 'CC',
    addresses: [],
    phoneNumbers: [],
    emailAddresses: [],
  }

  beforeEach(() => {
    auth = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
    auth.getApiClientToken.mockResolvedValue('court-creation-test-token')
    service = new HMPPSAgencyRegisterApi(auth)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  it('creates a court using the API client token and the complete creation DTO', async () => {
    const api = nock(config.apis.prisonRegister.url)
      .post('/courts', court)
      .matchHeader('authorization', 'Bearer court-creation-test-token')
      .reply(201, courtData.court({ courtId: court.courtId }))

    expect(await service.createCourt({ username: 'tom' }, court)).toEqual({ success: true })
    expect(auth.getApiClientToken).toHaveBeenCalledWith('tom')
    expect(api.isDone()).toBe(true)
  })

  it('returns actionable API validation errors for correction', async () => {
    nock(config.apis.prisonRegister.url)
      .post('/courts', court)
      .reply(400, { userMessage: 'Court NEWCC already exists' })

    expect(await service.createCourt({}, court)).toEqual({
      success: false,
      userMessage: 'Court NEWCC already exists',
    })
  })

  it.each([
    { status: 400, data: { developerMessage: 'Invalid request' } },
    { status: 400, data: { userMessage: ' ' } },
    { status: 403, data: { userMessage: 'Not authorised' } },
    { status: 500, data: { userMessage: 'Service unavailable' } },
  ])('propagates unexpected creation errors: $status $data', async ({ status, data }) => {
    nock(config.apis.prisonRegister.url).post('/courts', court).reply(status, data)

    await expect(service.createCourt({}, court)).rejects.toMatchObject({ status })
  })

  it('finds an existing court with the authenticated user context', async () => {
    const existing = courtData.court({ courtId: court.courtId })
    const api = nock(config.apis.prisonRegister.url)
      .get('/courts/id/NEWCC')
      .matchHeader('authorization', 'Bearer court-creation-test-token')
      .reply(200, existing)

    expect(await service.findCourt({ username: 'tom' }, court.courtId)).toEqual(existing)
    expect(auth.getApiClientToken).toHaveBeenCalledWith('tom')
    expect(api.isDone()).toBe(true)
  })

  it('treats only a not-found response as an available court ID', async () => {
    nock(config.apis.prisonRegister.url).get('/courts/id/NEWCC').reply(404, { userMessage: 'Not found' })

    expect(await service.findCourt({}, court.courtId)).toBeUndefined()
  })

  it.each([401, 403, 500])('propagates lookup failures rather than accepting an ID: %s', async status => {
    nock(config.apis.prisonRegister.url)
      .get('/courts/id/NEWCC')
      .times(status === 500 ? 3 : 1)
      .reply(status, {})

    await expect(service.findCourt({}, court.courtId)).rejects.toMatchObject({ status })
  })

  it('encodes the court ID when constructing the lookup URL', async () => {
    const api = nock(config.apis.prisonRegister.url).get('/courts/id/a%2Fb').reply(404, {})

    expect(await service.findCourt({}, 'a/b')).toBeUndefined()
    expect(api.isDone()).toBe(true)
  })

  it.each(['findCourt', 'createCourt'] as const)('propagates authentication failures for %s', async method => {
    const error = new Error('Authentication unavailable')
    auth.getApiClientToken.mockRejectedValue(error)

    const result = method === 'findCourt' ? service.findCourt({}, court.courtId) : service.createCourt({}, court)
    await expect(result).rejects.toBe(error)
  })
})
