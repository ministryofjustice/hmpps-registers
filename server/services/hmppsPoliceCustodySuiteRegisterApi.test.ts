import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import {
  EmailAddress,
  PhoneNumber,
  PoliceCustodySuite,
  CreatePoliceCustodySuite,
  UpdateAgencyAddress,
  UpdateEmailAddress,
  UpdatePoliceCustodySuite,
} from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Police Custody Suite Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getPoliceCustodySuites', () => {
    const policeCustodySuite: PoliceCustodySuite = {
      policeCustodySuiteId: 'SHFPCS',
      policeCustodySuiteName: 'Sheffield Police Custody Suite',
      active: true,
      addresses: [],
      emailAddresses: [],
      phoneNumbers: [],
    }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/police-custody-suites').reply(200, [])

      await hmppsAgencyRegisterApiService.getPoliceCustodySuites({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/police-custody-suites?active=true&textSearch=Sheffield')
        .reply(200, [policeCustodySuite])

      const result = await hmppsAgencyRegisterApiService.getPoliceCustodySuites(
        {},
        { active: true, textSearch: 'Sheffield' },
      )

      expect(result).toEqual([policeCustodySuite])
    })

    it('is ok if there are no police custody suites', async () => {
      fakeHmppsAgencyRegisterApi.get('/police-custody-suites').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getPoliceCustodySuites({}, {})

      expect(result).toEqual([])
    })

    it('will return all police custody suites', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/police-custody-suites')
        .reply(200, [policeCustodySuite, { ...policeCustodySuite, policeCustodySuiteId: 'LEEDPCS' }])

      const result = await hmppsAgencyRegisterApiService.getPoliceCustodySuites({}, {})

      expect(result).toEqual([policeCustodySuite, { ...policeCustodySuite, policeCustodySuiteId: 'LEEDPCS' }])
    })

    it.each([401, 403, 500])('propagates API failures when listing custody suites: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/police-custody-suites')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites({}, {})).rejects.toMatchObject({ status })
    })
  })

  describe('getPoliceCustodySuite', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/police-custody-suites/id/SHFPCS').reply(200, {})

      await hmppsAgencyRegisterApiService.getPoliceCustodySuite({ username: 'tommy' }, 'SHFPCS')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return a police custody suite', async () => {
      const policeCustodySuite: PoliceCustodySuite = {
        policeCustodySuiteId: 'SHFPCS',
        policeCustodySuiteName: 'Sheffield Police Custody Suite',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      }
      fakeHmppsAgencyRegisterApi.get('/police-custody-suites/id/SHFPCS').reply(200, policeCustodySuite)

      const result = await hmppsAgencyRegisterApiService.getPoliceCustodySuite({}, 'SHFPCS')

      expect(result).toEqual(policeCustodySuite)
    })

    it('will throw error when not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/police-custody-suites/id/SHFPCS').reply(404, {
        status: 404,
        developerMessage: 'Police custody suite SHFPCS not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getPoliceCustodySuite({}, 'SHFPCS')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('police custody suite mutations', () => {
    const create: CreatePoliceCustodySuite = {
      addresses: [],
      emailAddresses: [],
      phoneNumbers: [],
      policeCustodySuiteId: 'SHFPCS',
      policeCustodySuiteName: 'Sheffield Police Custody Suite',
      active: true,
    }
    const update: UpdatePoliceCustodySuite = {
      policeCustodySuiteName: 'Updated Sheffield Police Custody Suite',
      active: false,
    }
    const address: UpdateAgencyAddress = {
      addressLine1: '1 High Street',
      addressLine2: '',
      town: 'Sheffield',
      county: '  ',
      postcode: 'S1 2BJ',
      country: 'England',
    }
    const phoneNumber: PhoneNumber = { number: '0114 555 9898' }
    const emailAddress: EmailAddress = { address: 'custody@example.com' }
    const updatedEmailAddress: UpdateEmailAddress = { address: 'updated@example.com' }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('creates a custody suite using the authenticated user context', async () => {
      const scope = fakeHmppsAgencyRegisterApi.post('/police-custody-suites', create).reply(201, {})

      await expect(
        hmppsAgencyRegisterApiService.createPoliceCustodySuite({ username: 'tommy' }, create),
      ).resolves.toEqual({ success: true })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('updates suite details and encodes the suite ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/police-custody-suites/id/a%2Fb', update).reply(200, {})

      await expect(hmppsAgencyRegisterApiService.updatePoliceCustodySuiteDetails({}, 'a/b', update)).resolves.toEqual({
        success: true,
      })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/police-custody-suites/id/SHFPCS/address'],
      ['updates', 'put', '/police-custody-suites/id/SHFPCS/address/12'],
    ] as const)('%s a suite address, omitting blank optional fields', async (_operation, method, url) => {
      const expectedAddress = {
        addressLine1: '1 High Street',
        town: 'Sheffield',
        postcode: 'S1 2BJ',
        country: 'England',
      }
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, expectedAddress).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, expectedAddress).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addPoliceCustodySuiteAddress({}, 'SHFPCS', address)
          : await hmppsAgencyRegisterApiService.updatePoliceCustodySuiteAddress({}, 'SHFPCS', 12, address)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/police-custody-suites/id/SHFPCS/phone-number'],
      ['updates', 'put', '/police-custody-suites/id/SHFPCS/phone-number/8'],
    ] as const)('%s a suite phone number', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, phoneNumber).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, phoneNumber).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addPoliceCustodySuitePhoneNumber({}, 'SHFPCS', phoneNumber)
          : await hmppsAgencyRegisterApiService.updatePoliceCustodySuitePhoneNumber({}, 'SHFPCS', 8, phoneNumber)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it('adds and updates suite email addresses', async () => {
      const addScope = fakeHmppsAgencyRegisterApi
        .post('/police-custody-suites/id/SHFPCS/email-address', emailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.addPoliceCustodySuiteEmailAddress({}, 'SHFPCS', emailAddress),
      ).resolves.toEqual({ success: true })
      expect(addScope.isDone()).toBe(true)

      const updateScope = fakeHmppsAgencyRegisterApi
        .put('/police-custody-suites/id/SHFPCS/email-address/6', updatedEmailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updatePoliceCustodySuiteEmailAddress({}, 'SHFPCS', 6, updatedEmailAddress),
      ).resolves.toEqual({ success: true })
      expect(updateScope.isDone()).toBe(true)
    })

    it.each([
      ['/police-custody-suites/id/SHFPCS', () => hmppsAgencyRegisterApiService.deletePoliceCustodySuite({}, 'SHFPCS')],
      [
        '/police-custody-suites/id/SHFPCS/address/12',
        () => hmppsAgencyRegisterApiService.deletePoliceCustodySuiteAddress({}, 'SHFPCS', 12),
      ],
      [
        '/police-custody-suites/id/SHFPCS/phone-number/8',
        () => hmppsAgencyRegisterApiService.deletePoliceCustodySuitePhoneNumber({}, 'SHFPCS', 8),
      ],
      [
        '/police-custody-suites/id/SHFPCS/email-address/6',
        () => hmppsAgencyRegisterApiService.deletePoliceCustodySuiteEmailAddress({}, 'SHFPCS', 6),
      ],
    ])('deletes suite data at %s', async (url, deleteData) => {
      const scope = fakeHmppsAgencyRegisterApi.delete(url).reply(204)

      await deleteData()

      expect(scope.isDone()).toBe(true)
    })

    it('returns a validation message for invalid suite updates', async () => {
      fakeHmppsAgencyRegisterApi
        .put('/police-custody-suites/id/SHFPCS', update)
        .reply(400, { userMessage: 'Suite name is required' })

      await expect(
        hmppsAgencyRegisterApiService.updatePoliceCustodySuiteDetails({}, 'SHFPCS', update),
      ).resolves.toEqual({
        success: false,
        userMessage: 'Suite name is required',
      })
    })
  })
})
