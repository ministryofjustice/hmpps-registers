import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import { OtherAgency } from '../@types/prisonRegister'

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
})
