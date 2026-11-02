import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import {
  EmailAddress,
  PhoneNumber,
  ApprovedPremises,
  UpdateAgencyAddress,
  UpdateEmailAddress,
  UpdateApprovedPremises,
} from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Approved Premises Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllApprovedPremises', () => {
    const approvedPremises: ApprovedPremises = {
      approvedPremisesId: 'SHEFAP',
      approvedPremisesName: 'Sheffield Approved Premises',
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
      fakeHmppsAgencyRegisterApi.get('/approved-premises').reply(200, [])

      await hmppsAgencyRegisterApiService.getAllApprovedPremises({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/approved-premises?active=true&textSearch=Sheffield')
        .reply(200, [approvedPremises])

      const result = await hmppsAgencyRegisterApiService.getAllApprovedPremises(
        {},
        { active: true, textSearch: 'Sheffield' },
      )

      expect(result).toEqual([approvedPremises])
    })

    it('is ok if there are no approved premises', async () => {
      fakeHmppsAgencyRegisterApi.get('/approved-premises').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getAllApprovedPremises({}, {})

      expect(result).toEqual([])
    })

    it('will return all approved premises', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/approved-premises')
        .reply(200, [approvedPremises, { ...approvedPremises, approvedPremisesId: 'LEEDAP' }])

      const result = await hmppsAgencyRegisterApiService.getAllApprovedPremises({}, {})

      expect(result).toEqual([approvedPremises, { ...approvedPremises, approvedPremisesId: 'LEEDAP' }])
    })

    it.each([401, 403, 500])('propagates API failures when listing approved premises: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/approved-premises')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.getAllApprovedPremises({}, {})).rejects.toMatchObject({ status })
    })
  })

  describe('getApprovedPremises', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/approved-premises/id/SHEFAP').reply(200, {})

      await hmppsAgencyRegisterApiService.getApprovedPremises({ username: 'tommy' }, 'SHEFAP')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return approved premises', async () => {
      const approvedPremises: ApprovedPremises = {
        approvedPremisesId: 'SHEFAP',
        approvedPremisesName: 'Sheffield Approved Premises',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      }
      fakeHmppsAgencyRegisterApi.get('/approved-premises/id/SHEFAP').reply(200, approvedPremises)

      const result = await hmppsAgencyRegisterApiService.getApprovedPremises({}, 'SHEFAP')

      expect(result).toEqual(approvedPremises)
    })

    it('will throw error when not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/approved-premises/id/SHEFAP').reply(404, {
        status: 404,
        developerMessage: 'Approved premises SHEFAP not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getApprovedPremises({}, 'SHEFAP')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('approved premises mutations', () => {
    const update: UpdateApprovedPremises = {
      approvedPremisesName: 'Updated Sheffield Approved Premises',
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
    const emailAddress: EmailAddress = { address: 'premises@example.com' }
    const updatedEmailAddress: UpdateEmailAddress = { address: 'updated@example.com' }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('updates office details and encodes the office ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/approved-premises/id/a%2Fb', update).reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateApprovedPremisesDetails({ username: 'tommy' }, 'a/b', update),
      ).resolves.toEqual({ success: true })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/approved-premises/id/SHEFPB/address'],
      ['updates', 'put', '/approved-premises/id/SHEFPB/address/12'],
    ] as const)('%s an office address and omits blank optional fields', async (_operation, method, url) => {
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
          ? await hmppsAgencyRegisterApiService.addApprovedPremisesAddress({}, 'SHEFPB', address)
          : await hmppsAgencyRegisterApiService.updateApprovedPremisesAddress({}, 'SHEFPB', 12, address)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/approved-premises/id/SHEFPB/phone-number'],
      ['updates', 'put', '/approved-premises/id/SHEFPB/phone-number/8'],
    ] as const)('%s an office phone number', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, phoneNumber).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, phoneNumber).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addApprovedPremisesPhoneNumber({}, 'SHEFPB', phoneNumber)
          : await hmppsAgencyRegisterApiService.updateApprovedPremisesPhoneNumber({}, 'SHEFPB', 8, phoneNumber)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it('adds and updates office email addresses', async () => {
      const addScope = fakeHmppsAgencyRegisterApi
        .post('/approved-premises/id/SHEFPB/email-address', emailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.addApprovedPremisesEmailAddress({}, 'SHEFPB', emailAddress),
      ).resolves.toEqual({ success: true })
      expect(addScope.isDone()).toBe(true)

      const updateScope = fakeHmppsAgencyRegisterApi
        .put('/approved-premises/id/SHEFPB/email-address/6', updatedEmailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateApprovedPremisesEmailAddress({}, 'SHEFPB', 6, updatedEmailAddress),
      ).resolves.toEqual({ success: true })
      expect(updateScope.isDone()).toBe(true)
    })
  })
})
