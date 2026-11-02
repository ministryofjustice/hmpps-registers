import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import {
  CreateProbationOffice,
  EmailAddress,
  PhoneNumber,
  ProbationOffice,
  UpdateAgencyAddress,
  UpdateEmailAddress,
  UpdateProbationOffice,
} from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Probation Office Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getProbationOffices', () => {
    const probationOffice: ProbationOffice = {
      probationOfficeId: 'SHEFPB',
      probationOfficeName: 'Sheffield Probation Office',
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
      fakeHmppsAgencyRegisterApi.get('/probation-offices').reply(200, [])

      await hmppsAgencyRegisterApiService.getProbationOffices({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/probation-offices?active=true&textSearch=Sheffield')
        .reply(200, [probationOffice])

      const result = await hmppsAgencyRegisterApiService.getProbationOffices(
        {},
        { active: true, textSearch: 'Sheffield' },
      )

      expect(result).toEqual([probationOffice])
    })

    it('is ok if there are no probation offices', async () => {
      fakeHmppsAgencyRegisterApi.get('/probation-offices').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getProbationOffices({}, {})

      expect(result).toEqual([])
    })

    it('will return all probation offices', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/probation-offices')
        .reply(200, [probationOffice, { ...probationOffice, probationOfficeId: 'LEEDPB' }])

      const result = await hmppsAgencyRegisterApiService.getProbationOffices({}, {})

      expect(result).toEqual([probationOffice, { ...probationOffice, probationOfficeId: 'LEEDPB' }])
    })

    it.each([401, 403, 500])('propagates API failures when listing probation offices: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/probation-offices')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.getProbationOffices({}, {})).rejects.toMatchObject({ status })
    })
  })

  describe('getProbationOffice', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/probation-offices/id/SHEFPB').reply(200, {})

      await hmppsAgencyRegisterApiService.getProbationOffice({ username: 'tommy' }, 'SHEFPB')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return a probation office', async () => {
      const probationOffice: ProbationOffice = {
        probationOfficeId: 'SHEFPB',
        probationOfficeName: 'Sheffield Probation Office',
        active: true,
        addresses: [],
        emailAddresses: [],
        phoneNumbers: [],
      }
      fakeHmppsAgencyRegisterApi.get('/probation-offices/id/SHEFPB').reply(200, probationOffice)

      const result = await hmppsAgencyRegisterApiService.getProbationOffice({}, 'SHEFPB')

      expect(result).toEqual(probationOffice)
    })

    it('will throw error when not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/probation-offices/id/SHEFPB').reply(404, {
        status: 404,
        developerMessage: 'Probation office SHEFPB not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getProbationOffice({}, 'SHEFPB')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('probation office mutations', () => {
    const create: CreateProbationOffice = {
      probationOfficeId: 'SHEFPB',
      probationOfficeName: 'Sheffield Probation Office',
      active: true,
      addresses: [],
      emailAddresses: [],
      phoneNumbers: [],
    }
    const update: UpdateProbationOffice = {
      probationOfficeName: 'Updated Sheffield Probation Office',
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
    const emailAddress: EmailAddress = { address: 'probation@example.com' }
    const updatedEmailAddress: UpdateEmailAddress = { address: 'updated@example.com' }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('creates an office using the authenticated user context', async () => {
      const scope = fakeHmppsAgencyRegisterApi.post('/probation-offices', create).reply(201, {})

      await expect(hmppsAgencyRegisterApiService.createProbationOffice({ username: 'tommy' }, create)).resolves.toEqual(
        { success: true },
      )

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('updates office details and encodes the office ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/probation-offices/id/a%2Fb', update).reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateProbationOfficeDetails({ username: 'tommy' }, 'a/b', update),
      ).resolves.toEqual({ success: true })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/probation-offices/id/SHEFPB/address'],
      ['updates', 'put', '/probation-offices/id/SHEFPB/address/12'],
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
          ? await hmppsAgencyRegisterApiService.addProbationOfficeAddress({}, 'SHEFPB', address)
          : await hmppsAgencyRegisterApiService.updateProbationOfficeAddress({}, 'SHEFPB', 12, address)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      ['adds', 'post', '/probation-offices/id/SHEFPB/phone-number'],
      ['updates', 'put', '/probation-offices/id/SHEFPB/phone-number/8'],
    ] as const)('%s an office phone number', async (_operation, method, url) => {
      const scope =
        method === 'post'
          ? fakeHmppsAgencyRegisterApi.post(url, phoneNumber).reply(200, {})
          : fakeHmppsAgencyRegisterApi.put(url, phoneNumber).reply(200, {})

      const result =
        method === 'post'
          ? await hmppsAgencyRegisterApiService.addProbationOfficePhoneNumber({}, 'SHEFPB', phoneNumber)
          : await hmppsAgencyRegisterApiService.updateProbationOfficePhoneNumber({}, 'SHEFPB', 8, phoneNumber)

      expect(result).toEqual({ success: true })
      expect(scope.isDone()).toBe(true)
    })

    it('adds and updates office email addresses', async () => {
      const addScope = fakeHmppsAgencyRegisterApi
        .post('/probation-offices/id/SHEFPB/email-address', emailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.addProbationOfficeEmailAddress({}, 'SHEFPB', emailAddress),
      ).resolves.toEqual({ success: true })
      expect(addScope.isDone()).toBe(true)

      const updateScope = fakeHmppsAgencyRegisterApi
        .put('/probation-offices/id/SHEFPB/email-address/6', updatedEmailAddress)
        .reply(200, {})

      await expect(
        hmppsAgencyRegisterApiService.updateProbationOfficeEmailAddress({}, 'SHEFPB', 6, updatedEmailAddress),
      ).resolves.toEqual({ success: true })
      expect(updateScope.isDone()).toBe(true)
    })
  })
})
