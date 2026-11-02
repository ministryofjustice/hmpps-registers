import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import { CreateHospital, Hospital, PhoneNumber, UpdateAgencyAddress, UpdateHospital } from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Hospital Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getHospitals', () => {
    const hospital: Hospital = {
      hospitalId: 'SHEFH',
      hospitalName: 'Sheffield Hospital',
      active: true,
      highSecurity: false,
      addresses: [],
      phoneNumbers: [],
    }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/hospitals').reply(200, [])

      await hmppsAgencyRegisterApiService.getHospitals({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/hospitals?active=true&textSearch=Sheffield&highSecurity=true')
        .reply(200, [{ ...hospital, highSecurity: true }])

      const result = await hmppsAgencyRegisterApiService.getHospitals(
        {},
        { active: true, textSearch: 'Sheffield', highSecurity: true },
      )

      expect(result).toEqual([{ ...hospital, highSecurity: true }])
    })

    it('is ok if there are no hospitals', async () => {
      fakeHmppsAgencyRegisterApi.get('/hospitals').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getHospitals({}, {})

      expect(result).toEqual([])
    })

    it('will return all hospitals', async () => {
      fakeHmppsAgencyRegisterApi.get('/hospitals').reply(200, [hospital, { ...hospital, hospitalId: 'LEEDH' }])

      const result = await hmppsAgencyRegisterApiService.getHospitals({}, {})

      expect(result).toEqual([hospital, { ...hospital, hospitalId: 'LEEDH' }])
    })

    it.each([401, 403, 500])('propagates API failures when listing hospitals: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/hospitals')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.getHospitals({}, {})).rejects.toMatchObject({ status })
    })
  })

  describe('getHospital', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/hospitals/id/SHEFH').reply(200, {})

      await hmppsAgencyRegisterApiService.getHospital({ username: 'tommy' }, 'SHEFH')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return a hospital', async () => {
      const hospital: Hospital = {
        hospitalId: 'SHEFH',
        hospitalName: 'Sheffield Hospital',
        active: true,
        highSecurity: true,
        addresses: [],
        phoneNumbers: [],
      }
      fakeHmppsAgencyRegisterApi.get('/hospitals/id/SHEFH').reply(200, hospital)

      const result = await hmppsAgencyRegisterApiService.getHospital({}, 'SHEFH')

      expect(result).toEqual(hospital)
    })

    it('will throw error when not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/hospitals/id/SHEFH').reply(404, {
        status: 404,
        developerMessage: 'Hospital SHEFH not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getHospital({}, 'SHEFH')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('hospital mutations', () => {
    const hospital: CreateHospital = {
      hospitalId: 'SHEFH',
      hospitalName: 'Sheffield Hospital',
      active: true,
      highSecurity: false,
      addresses: [],
      phoneNumbers: [],
    }
    const update: UpdateHospital = { hospitalName: 'Updated Hospital', active: false, highSecurity: true }
    const address: UpdateAgencyAddress = {
      addressLine1: '1 High Street',
      addressLine2: '',
      town: 'Sheffield',
      county: '  ',
      postcode: 'S1 2BJ',
      country: 'England',
    }
    const phoneNumber: PhoneNumber = { number: '0114 555 9898' }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('creates a hospital with its supplied details', async () => {
      const scope = fakeHmppsAgencyRegisterApi.post('/hospitals', hospital).reply(201, {})

      await expect(hmppsAgencyRegisterApiService.createHospital({}, hospital)).resolves.toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it('updates hospital details and encodes the hospital ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/hospitals/id/a%2Fb', update).reply(200, {})

      await expect(hmppsAgencyRegisterApiService.updateHospitalDetails({}, 'a/b', update)).resolves.toEqual({
        success: true,
      })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/hospitals/id/SHEFH/address'],
      ['updates', 'put', '/hospitals/id/SHEFH/address/12'],
    ] as const)('%s a hospital address, omitting blank optional fields', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi
              .post(url, {
                addressLine1: '1 High Street',
                town: 'Sheffield',
                postcode: 'S1 2BJ',
                country: 'England',
              })
              .reply(200, {})
          : fakeHmppsAgencyRegisterApi
              .put(url, {
                addressLine1: '1 High Street',
                town: 'Sheffield',
                postcode: 'S1 2BJ',
                country: 'England',
              })
              .reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addHospitalAddress({}, 'SHEFH', address)
          : await hmppsAgencyRegisterApiService.updateHospitalAddress({}, 'SHEFH', 12, address)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/hospitals/id/SHEFH/phone-number'],
      ['updates', 'put', '/hospitals/id/SHEFH/phone-number/8'],
    ] as const)('%s a hospital phone number', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, phoneNumber).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, phoneNumber).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addHospitalPhoneNumber({}, 'SHEFH', phoneNumber)
          : await hmppsAgencyRegisterApiService.updateHospitalPhoneNumber({}, 'SHEFH', 8, phoneNumber)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['/hospitals/id/SHEFH', () => hmppsAgencyRegisterApiService.deleteHospital({}, 'SHEFH')],
      ['/hospitals/id/SHEFH/address/12', () => hmppsAgencyRegisterApiService.deleteHospitalAddress({}, 'SHEFH', 12)],
      [
        '/hospitals/id/SHEFH/phone-number/8',
        () => hmppsAgencyRegisterApiService.deleteHospitalPhoneNumber({}, 'SHEFH', 8),
      ],
    ])('deletes hospital data at %s', async (url, deleteData) => {
      const scope = fakeHmppsAgencyRegisterApi.delete(url).reply(204)

      await deleteData()

      expect(scope.isDone()).toBe(true)
    })

    it('returns a validation message for invalid hospital updates', async () => {
      fakeHmppsAgencyRegisterApi
        .put('/hospitals/id/SHEFH', update)
        .reply(400, { userMessage: 'Hospital name is required' })

      await expect(hmppsAgencyRegisterApiService.updateHospitalDetails({}, 'SHEFH', update)).resolves.toEqual({
        success: false,
        userMessage: 'Hospital name is required',
      })
    })
  })
})
