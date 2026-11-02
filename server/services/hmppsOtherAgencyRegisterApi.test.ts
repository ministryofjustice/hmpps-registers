import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import {
  EmailAddress,
  PhoneNumber,
  OtherAgency,
  UpdateAgencyAddress,
  UpdateEmailAddress,
  UpdateOtherAgency,
} from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Other Agency Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getOtherAgencies', () => {
    const agency: OtherAgency = {
      agencyId: 'SHEF',
      agencyName: 'Sheffield Agency',
      active: true,
      agencyType: 'PECS',
      addresses: [],
      emailAddresses: [],
      phoneNumbers: [],
    }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/other-agencies').reply(200, [])

      await hmppsAgencyRegisterApiService.getOtherAgencies({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/other-agencies?active=true&textSearch=Sheffield&otherAgencyTypeCodes=PECS')
        .reply(200, [agency])

      const result = await hmppsAgencyRegisterApiService.getOtherAgencies(
        {},
        { active: true, textSearch: 'Sheffield', otherAgencyTypeCodes: ['PECS'] },
      )

      expect(result).toEqual([agency])
    })

    it('is ok if there are no other agencies', async () => {
      fakeHmppsAgencyRegisterApi.get('/other-agencies').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getOtherAgencies({}, {})

      expect(result).toEqual([])
    })

    it('will return all other agencies', async () => {
      fakeHmppsAgencyRegisterApi.get('/other-agencies').reply(200, [agency, { ...agency, agencyId: 'LEED' }])

      const result = await hmppsAgencyRegisterApiService.getOtherAgencies({}, {})

      expect(result).toEqual([agency, { ...agency, agencyId: 'LEED' }])
    })

    it.each([401, 403, 500])('propagates API failures when listing agencies: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/other-agencies')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.getOtherAgencies({}, {})).rejects.toMatchObject({ status })
    })
  })

  describe('getOtherAgency', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/other-agencies/id/SHEF').reply(200, {})

      await hmppsAgencyRegisterApiService.getOtherAgency({ username: 'tommy' }, 'SHEF')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return an other agency', async () => {
      const agency: OtherAgency = {
        agencyId: 'SHEF',
        agencyName: 'Sheffield Agency',
        active: true,
        agencyType: 'PECS',
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      }
      fakeHmppsAgencyRegisterApi.get('/other-agencies/id/SHEF').reply(200, agency)

      const result = await hmppsAgencyRegisterApiService.getOtherAgency({}, 'SHEF')

      expect(result).toEqual(agency)
    })

    it('will propagate errors when the other agency cannot be retrieved', async () => {
      fakeHmppsAgencyRegisterApi.get('/other-agencies/id/UNKNOWN').reply(404, {
        status: 404,
        developerMessage: 'Other agency UNKNOWN not found',
      })

      await expect(hmppsAgencyRegisterApiService.getOtherAgency({}, 'UNKNOWN')).rejects.toThrow('Not Found')
    })
  })
  describe('other agency mutations', () => {
    const update: UpdateOtherAgency = {
      agencyName: 'Updated Sheffield Agency',
      otherAgencyType: 'PECS',
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
    const emailAddress: EmailAddress = { address: 'agency@example.com' }
    const updatedEmailAddress: UpdateEmailAddress = { address: 'updated@example.com' }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('updates office details and encodes the office ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/other-agencies/id/a%2Fb', update).reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateOtherAgencyDetails({ username: 'tommy' }, 'a/b', update),
      ).resolves.toEqual({ success: true })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/other-agencies/id/SHEFPECS/address'],
      ['updates', 'put', '/other-agencies/id/SHEFPECS/address/12'],
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
          ? await hmppsAgencyRegisterApiService.addOtherAgencyAddress({}, 'SHEFPECS', address)
          : await hmppsAgencyRegisterApiService.updateOtherAgencyAddress({}, 'SHEFPECS', 12, address)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/other-agencies/id/SHEFPECS/phone-number'],
      ['updates', 'put', '/other-agencies/id/SHEFPECS/phone-number/8'],
    ] as const)('%s an office phone number', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, phoneNumber).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, phoneNumber).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addOtherAgencyPhoneNumber({}, 'SHEFPECS', phoneNumber)
          : await hmppsAgencyRegisterApiService.updateOtherAgencyPhoneNumber({}, 'SHEFPECS', 8, phoneNumber)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it('adds and updates office email addresses', async () => {
      const addScope = fakeHmppsAgencyRegisterApi
        .post('/other-agencies/id/SHEFPECS/email-address', emailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.addOtherAgencyEmailAddress({}, 'SHEFPECS', emailAddress),
      ).resolves.toEqual({ success: true })
      expect(addScope.isDone()).toBe(true)

      const updateScope = fakeHmppsAgencyRegisterApi
        .put('/other-agencies/id/SHEFPECS/email-address/6', updatedEmailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateOtherAgencyEmailAddress({}, 'SHEFPECS', 6, updatedEmailAddress),
      ).resolves.toEqual({ success: true })
      expect(updateScope.isDone()).toBe(true)
    })
  })
})
