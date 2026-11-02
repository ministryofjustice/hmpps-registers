import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import { ProbationOffice } from '../@types/prisonRegister'

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
})
