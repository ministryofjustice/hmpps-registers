import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import data from '../routes/testutils/mockPrisonData'
import {
  CodeDescription,
  InsertPrison,
  ApprovedPremises,
  Hospital,
  OtherAgency,
  PoliceCustodySuite,
  ProbationOffice,
  UpdatePrison,
  UpdatePrisonAddress,
} from '../@types/prisonRegister'
import { moorlandPrison } from '../../integration_tests/mockApis/hmppsAgencyRegisterApi'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Agency Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('isAgencyIdUsed', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAuthClient.getApiClientToken.mockResolvedValue('agency-usage-token')
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('returns the existing agency using the authenticated user context', async () => {
      const agency = { agencyId: 'MDI', name: 'Moorland HMP', legacyType: 'PRISON' }
      const scope = fakeHmppsAgencyRegisterApi
        .get('/legacy/agency/MDI/is-used')
        .matchHeader('authorization', 'Bearer agency-usage-token')
        .reply(200, agency)

      await expect(hmppsAgencyRegisterApiService.isAgencyIdUsed({ username: 'tommy' }, 'MDI')).resolves.toEqual(agency)
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('treats a 204 response with no body as an unused ID', async () => {
      fakeHmppsAgencyRegisterApi.get('/legacy/agency/NEWCC/is-used').reply(204)

      await expect(hmppsAgencyRegisterApiService.isAgencyIdUsed({}, 'NEWCC')).resolves.toBeUndefined()
    })

    it('encodes the agency ID in the lookup URL', async () => {
      const scope = fakeHmppsAgencyRegisterApi.get('/legacy/agency/a%2Fb/is-used').reply(204)

      await expect(hmppsAgencyRegisterApiService.isAgencyIdUsed({}, 'a/b')).resolves.toBeUndefined()
      expect(scope.isDone()).toBe(true)
    })

    it.each([401, 403, 404, 500])('propagates lookup failures rather than accepting an ID: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .get('/legacy/agency/NEWCC/is-used')
        .times(status === 500 ? 3 : 1)
        .reply(status, { userMessage: 'Lookup failed' })

      await expect(hmppsAgencyRegisterApiService.isAgencyIdUsed({}, 'NEWCC')).rejects.toMatchObject({ status })
    })

    it('propagates authentication failures', async () => {
      const error = new Error('Authentication unavailable')
      hmppsAuthClient.getApiClientToken.mockRejectedValueOnce(error)

      await expect(hmppsAgencyRegisterApiService.isAgencyIdUsed({}, 'NEWCC')).rejects.toBe(error)
    })
  })

  describe('getPrisonsWithFilter', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/search').reply(200, [])

      await hmppsAgencyRegisterApiService.getPrisonsWithFilter({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('is ok if there are no prisons', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/search').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getPrisonsWithFilter({}, {})

      expect(result).toEqual([])
    })

    it('will return all prisons with filter', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/prisons/search?active=true&textSearch=ALI')
        .reply(200, [data.prison({}), data.prison({})])

      const result = await hmppsAgencyRegisterApiService.getPrisonsWithFilter({}, { active: true, textSearch: 'ALI' })

      expect(result).toHaveLength(2)
    })
  })

  describe('getPrison', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/ALI').reply(200, [])

      await hmppsAgencyRegisterApiService.getPrison({ username: 'tommy' }, 'ALI')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return the prison', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/ALI').reply(200, data.prison({}))

      const result = await hmppsAgencyRegisterApiService.getPrison({}, 'ALI')

      expect(result.prisonId).toEqual('ALI')
    })

    it('will throw error when not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/ALI').reply(404, {
        status: 404,
        developerMessage: 'Prison ALI not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getPrison({}, 'ALI')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('updatePrisonDetails', () => {
    let updatedPrison: UpdatePrison
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI').reply(200, data.prison({ active: false }))
      fakeHmppsAgencyRegisterApi
        .put('/prison-maintenance/id/MDI', body => {
          updatedPrison = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await hmppsAgencyRegisterApiService.updatePrisonDetails(
        { username: 'tommy' },
        'MDI',
        'HMP Moorland',
        '',
        'yes',
        'no',
        true,
        false,
        [],
      )

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send current active marker with request', async () => {
      await hmppsAgencyRegisterApiService.updatePrisonDetails(
        { username: 'tommy' },
        'MDI',
        'HMP Moorland Updated',
        '',
        'yes',
        'no',
        true,
        false,
        ['HMP'],
      )

      expect(updatedPrison).toEqual(
        expect.objectContaining({
          prisonName: 'HMP Moorland Updated',
          active: false,
          male: true,
          female: false,
          prisonTypes: ['HMP'],
        }),
      )
    })
  })

  describe('updateActivePrisonMarker', () => {
    let updatedPrison: UpdatePrison
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI').reply(200, moorlandPrison)
      fakeHmppsAgencyRegisterApi
        .put('/prison-maintenance/id/MDI', body => {
          updatedPrison = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await hmppsAgencyRegisterApiService.updateActivePrisonMarker({ username: 'tommy' }, 'MDI', true)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send all data back with active marker now false', async () => {
      await hmppsAgencyRegisterApiService.updateActivePrisonMarker({ username: 'tommy' }, 'MDI', false)

      expect(updatedPrison).toEqual(
        expect.objectContaining({
          prisonName: 'HMP Moorland',
          active: false,
          male: false,
          female: true,
          prisonTypes: ['HMP', 'YOI'],
        }),
      )
    })
  })

  describe('findPrisonAddress', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI/address/21').reply(200, data.prisonAddress({}))

      await hmppsAgencyRegisterApiService.getPrisonAddress({ username: 'tommy' }, 'MDI', '21')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the prison address when found', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI/address/21').reply(200, data.prisonAddress({}))

      const prisonAddress = await hmppsAgencyRegisterApiService.getPrisonAddress({}, 'MDI', '21')

      expect(prisonAddress?.id).toEqual(21)
    })
    it('will be undefined when prison address not found', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI/address/66').reply(404, {
        status: 404,
        developerMessage: 'Address 66 not found',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getPrisonAddress({}, 'MDI', '66')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
    it('will send error when prison address not associated with prison', async () => {
      fakeHmppsAgencyRegisterApi.get('/prisons/id/MDI/address/66').reply(404, {
        status: 404,
        developerMessage: 'Address 66 not in prison MDI',
      })

      expect.assertions(1)
      try {
        await hmppsAgencyRegisterApiService.getPrisonAddress({}, 'MDI', '66')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('updatePrisonAddress', () => {
    let updatedPrisonAddress: UpdatePrisonAddress
    const prisonAddress = data.prisonAddress({})
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi
        .put('/prison-maintenance/id/MDI/address/21', body => {
          updatedPrisonAddress = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await hmppsAgencyRegisterApiService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', prisonAddress)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send update prison address', async () => {
      await hmppsAgencyRegisterApiService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', prisonAddress)

      expect(updatedPrisonAddress).toEqual(prisonAddress)
    })
    it('will send no attribute rather than blanks', async () => {
      const addressWithBlanks: UpdatePrisonAddress = { ...prisonAddress, addressLine1: '', county: '  ' }
      await hmppsAgencyRegisterApiService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', addressWithBlanks)

      expect(updatedPrisonAddress).toEqual({
        id: 21,
        addressLine2: 'Hatfield Woodhouse',
        town: 'Doncaster',
        postcode: 'DN7 6BW',
        country: 'England',
      })
    })
  })

  describe('updateAddressWithWelshPrisonAddress', () => {
    const welshPrisonAddress = data.welshPrisonAddress({})
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi
        .put('/prison-maintenance/id/CFI/welsh-address/21', welshPrisonAddress)
        .reply(200, welshPrisonAddress)
    })
    it('username will be used by client', async () => {
      await hmppsAgencyRegisterApiService.updateAddressWithWelshPrisonAddress(
        { username: 'tommy' },
        'CFI',
        '21',
        welshPrisonAddress,
      )

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will send update prison address', async () => {
      await hmppsAgencyRegisterApiService.updateAddressWithWelshPrisonAddress(
        { username: 'tommy' },
        'CFI',
        '21',
        welshPrisonAddress,
      )

      expect(welshPrisonAddress).toEqual(welshPrisonAddress)
    })
  })

  describe('addPrison', () => {
    let addPrisonRequest: InsertPrison

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      addPrisonRequest = {
        active: false,
        female: false,
        male: false,
        contracted: true,
        prisonId: 'SHEF',
        lthse: false,
        prisonName: 'Sheffield Prison',
        prisonTypes: ['HMP'],
        categories: [],
        addresses: [
          {
            addressLine1: '1 High Street',
            addressLine2: 'Main centre',
            town: 'Sheffield',
            county: 'South Yorkshire',
            postcode: 'S1 2BJ',
            country: 'England',
          },
        ],
      }
    })
    describe('on failure', () => {
      it('will send back error if prison failed to be added due to bad request', async () => {
        fakeHmppsAgencyRegisterApi.post('/prison-maintenance').reply(400, {
          timestamp: '2022-03-30 10:42:59',
          status: 400,
          error: 'Bad Request',
          message: "Validation failed for object='insertPrisonDto'. Error count: 1",
          path: '/prison-maintenance',
        })

        try {
          await hmppsAgencyRegisterApiService.addPrison({ username: 'tommy' }, addPrisonRequest)
        } catch (e) {
          expect(e.data.message).toEqual("Validation failed for object='insertPrisonDto'. Error count: 1")
        }
      })
      it('will throw error if prison failed to be added due to some of reason', async () => {
        fakeHmppsAgencyRegisterApi
          .post('/prison-maintenance')
          .reply(500, {
            timestamp: '2021-03-30 10:42:59',
            status: 500,
            error: 'Bad Request',
            message: 'Internal Error',
            path: '/prison-maintenance',
          })
          .persist()

        expect.assertions(1)
        try {
          await hmppsAgencyRegisterApiService.addPrison({ username: 'tommy' }, addPrisonRequest)
        } catch (e) {
          expect(e.message).toEqual('Internal Server Error')
        }
      })
    })

    describe('on success', () => {
      let newAddedPrison: InsertPrison | null
      beforeEach(() => {
        addPrisonRequest = {
          prisonId: 'SHEF',
          prisonName: 'Sheffield Prison',
          prisonTypes: ['HMP'],
          active: true,
          female: false,
          male: true,
          contracted: true,
          lthse: false,
          categories: [],
          addresses: [
            {
              addressLine1: '1 High Street',
              addressLine2: 'Main centre',
              town: 'Sheffield',
              county: 'South Yorkshire',
              postcode: 'S1 2BJ',
              country: 'England',
            },
          ],
        }
        newAddedPrison = null

        fakeHmppsAgencyRegisterApi
          .post('/prison-maintenance', body => {
            newAddedPrison = body
            return body
          })
          .reply(200, data.prison({ prisonId: 'SHEF' }))
      })
      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })
      it('will send back success', async () => {
        const result = await hmppsAgencyRegisterApiService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(result.success).toEqual(true)
      })
      it('prison and address will be sent together when adding', async () => {
        await hmppsAgencyRegisterApiService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(newAddedPrison).toEqual({
          prisonId: 'SHEF',
          prisonName: 'Sheffield Prison',
          prisonTypes: ['HMP'],
          active: true,
          female: false,
          male: true,
          contracted: true,
          lthse: false,
          categories: [],
          addresses: [
            {
              addressLine1: '1 High Street',
              addressLine2: 'Main centre',
              town: 'Sheffield',
              county: 'South Yorkshire',
              postcode: 'S1 2BJ',
              country: 'England',
            },
          ],
        })
      })
    })
  })

  describe('addPrisonAddress', () => {
    let newPrisonAddress: UpdatePrisonAddress
    const prisonAddress = data.prisonAddress({})
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi
        .post('/prison-maintenance/id/MDI/address', body => {
          newPrisonAddress = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await hmppsAgencyRegisterApiService.addPrisonAddress({ username: 'tommy' }, 'MDI', prisonAddress)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send add prison address', async () => {
      await hmppsAgencyRegisterApiService.addPrisonAddress({ username: 'tommy' }, 'MDI', prisonAddress)

      expect(newPrisonAddress).toEqual(prisonAddress)
    })
    it('will not send blank address fields', async () => {
      const addressWithBlanks: UpdatePrisonAddress = { ...prisonAddress, addressLine1: '', county: '  ' }
      await hmppsAgencyRegisterApiService.addPrisonAddress({ username: 'tommy' }, 'MDI', addressWithBlanks)

      expect(newPrisonAddress).toEqual({
        id: 21,
        addressLine2: 'Hatfield Woodhouse',
        town: 'Doncaster',
        postcode: 'DN7 6BW',
        country: 'England',
      })
    })
  })

  describe('deletePrisonAddress', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi.delete('/prison-maintenance/id/MDI/address/21').reply(200)
    })
    it('will delete prison address', async () => {
      await hmppsAgencyRegisterApiService.deletePrisonAddress({ username: 'tommy' }, 'MDI', '21')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
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
  })

  describe('getAreas', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      hmppsAuthClient.getApiClientToken.mockResolvedValue('area-token')
    })

    it('uses the username and bearer token to fetch areas without query filters', async () => {
      const areas: CodeDescription[] = [
        { code: 'YH', description: 'Yorkshire and the Humber' },
        { code: 'NW', description: 'North West' },
      ]
      fakeHmppsAgencyRegisterApi
        .get('/reference-data/areas')
        .matchHeader('authorization', 'Bearer area-token')
        .reply(200, areas)

      expect(await hmppsAgencyRegisterApiService.getAreas({ username: 'tommy' })).toEqual(areas)
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(true)
    })

    it('returns an empty list when there are no areas and the context has no username', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/areas').reply(200, [])

      expect(await hmppsAgencyRegisterApiService.getAreas({})).toEqual([])
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith(undefined)
    })

    it('propagates reference data API errors', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/areas').reply(404, { developerMessage: 'Areas not found' })

      await expect(hmppsAgencyRegisterApiService.getAreas({})).rejects.toThrow('Not Found')
    })

    it('propagates authentication errors without calling the areas API', async () => {
      const error = new Error('Authentication unavailable')
      hmppsAuthClient.getApiClientToken.mockRejectedValueOnce(error)
      fakeHmppsAgencyRegisterApi.get('/reference-data/areas').reply(200, [])

      await expect(hmppsAgencyRegisterApiService.getAreas({ username: 'tommy' })).rejects.toBe(error)
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(false)
    })
  })

  describe('getPayrollRegions', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('uses the username and bearer token to fetch payroll regions', async () => {
      hmppsAuthClient.getApiClientToken.mockResolvedValueOnce('payroll-region-test-token')
      const payrollRegions: CodeDescription[] = [
        { code: 'YH', description: 'Yorkshire and the Humber' },
        { code: 'NE', description: 'North East' },
      ]
      fakeHmppsAgencyRegisterApi
        .get('/reference-data/payroll-regions')
        .matchHeader('authorization', 'Bearer payroll-region-test-token')
        .reply(200, payrollRegions)

      expect(await hmppsAgencyRegisterApiService.getPayrollRegions({ username: 'tommy' })).toEqual(payrollRegions)
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(true)
    })

    it('returns an empty list when no payroll regions are available', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/payroll-regions').reply(200, [])

      expect(await hmppsAgencyRegisterApiService.getPayrollRegions({})).toEqual([])
    })

    it('propagates reference data API errors', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/payroll-regions').reply(404, { developerMessage: 'Not found' })

      await expect(hmppsAgencyRegisterApiService.getPayrollRegions({})).rejects.toThrow('Not Found')
    })

    it('propagates authentication errors without calling the API', async () => {
      const error = new Error('Authentication unavailable')
      hmppsAuthClient.getApiClientToken.mockRejectedValueOnce(error)
      fakeHmppsAgencyRegisterApi.get('/reference-data/payroll-regions').reply(200, [])

      await expect(hmppsAgencyRegisterApiService.getPayrollRegions({ username: 'tommy' })).rejects.toBe(error)
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(false)
    })
  })

  describe('getLocalAuthorities', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('uses the username and bearer token to fetch local authorities', async () => {
      hmppsAuthClient.getApiClientToken.mockResolvedValueOnce('local-authority-test-token')
      const localAuthorities: CodeDescription[] = [
        { code: 'SHEF', description: 'Sheffield' },
        { code: 'LEED', description: 'Leeds' },
      ]
      fakeHmppsAgencyRegisterApi
        .get('/reference-data/local-authorities')
        .matchHeader('authorization', 'Bearer local-authority-test-token')
        .reply(200, localAuthorities)

      expect(await hmppsAgencyRegisterApiService.getLocalAuthorities({ username: 'tommy' })).toEqual(localAuthorities)
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(true)
    })

    it('returns an empty list when no local authorities are available', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/local-authorities').reply(200, [])

      expect(await hmppsAgencyRegisterApiService.getLocalAuthorities({})).toEqual([])
    })

    it('propagates reference data API errors', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/local-authorities').reply(404, { developerMessage: 'Not found' })

      await expect(hmppsAgencyRegisterApiService.getLocalAuthorities({})).rejects.toThrow('Not Found')
    })

    it('propagates authentication errors without calling the API', async () => {
      const error = new Error('Authentication unavailable')
      hmppsAuthClient.getApiClientToken.mockRejectedValueOnce(error)
      fakeHmppsAgencyRegisterApi.get('/reference-data/local-authorities').reply(200, [])

      await expect(hmppsAgencyRegisterApiService.getLocalAuthorities({ username: 'tommy' })).rejects.toBe(error)
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(false)
    })
  })

  describe('getRegions', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('uses the username and bearer token to fetch regions', async () => {
      const regions: CodeDescription[] = [
        { code: 'YH', description: 'Yorkshire and the Humber' },
        { code: 'NE', description: 'North East' },
      ]
      fakeHmppsAgencyRegisterApi.get('/reference-data/regions').reply(200, regions)

      expect(await hmppsAgencyRegisterApiService.getRegions({ username: 'tommy' })).toEqual(regions)
      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(fakeHmppsAgencyRegisterApi.isDone()).toBe(true)
    })

    it('propagates reference data API errors', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/regions').reply(404, { developerMessage: 'Regions not found' })

      await expect(hmppsAgencyRegisterApiService.getRegions({})).rejects.toThrow('Not Found')
    })
  })

  describe('getTownSuggestions', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/towns').reply(200, [])

      await hmppsAgencyRegisterApiService.getTownSuggestions({ username: 'tommy' })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return town suggestions', async () => {
      const suggestions: CodeDescription[] = [
        { code: 'SHEF', description: 'Sheffield' },
        { code: 'LEED', description: 'Leeds' },
      ]
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/towns').reply(200, suggestions)

      const result = await hmppsAgencyRegisterApiService.getTownSuggestions({})

      expect(result).toEqual(suggestions)
    })

    it('is ok if there are no town suggestions', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/towns').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getTownSuggestions({})

      expect(result).toEqual([])
    })

    it('will throw an error when town suggestions cannot be retrieved', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/towns').reply(404, {
        status: 404,
        developerMessage: 'Town suggestions not found',
      })

      await expect(hmppsAgencyRegisterApiService.getTownSuggestions({})).rejects.toThrow('Not Found')
    })
  })

  describe('getCountySuggestions', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/counties').reply(200, [])

      await hmppsAgencyRegisterApiService.getCountySuggestions({ username: 'tommy' })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return county suggestions', async () => {
      const suggestions: CodeDescription[] = [
        { code: 'SY', description: 'South Yorkshire' },
        { code: 'WY', description: 'West Yorkshire' },
      ]
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/counties').reply(200, suggestions)

      const result = await hmppsAgencyRegisterApiService.getCountySuggestions({})

      expect(result).toEqual(suggestions)
    })

    it('is ok if there are no county suggestions', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/counties').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getCountySuggestions({})

      expect(result).toEqual([])
    })

    it('will throw an error when county suggestions cannot be retrieved', async () => {
      fakeHmppsAgencyRegisterApi.get('/reference-data/suggestions/counties').reply(404, {
        status: 404,
        developerMessage: 'County suggestions not found',
      })

      await expect(hmppsAgencyRegisterApiService.getCountySuggestions({})).rejects.toThrow('Not Found')
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
})
