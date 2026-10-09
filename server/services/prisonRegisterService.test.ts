import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import PrisonRegisterService from './prisonRegisterService'
import TokenStore from '../data/tokenStore/redisTokenStore'
import data from '../routes/testutils/mockPrisonData'
import courtData from '../routes/testutils/mockCourtData'
import {
  AgencyEmailAddress,
  EmailAddress,
  InsertPrison,
  ApprovedPremises,
  Hospital,
  OtherAgency,
  PoliceCustodySuite,
  ProbationOffice,
  UpdatePrison,
  UpdatePrisonAddress,
  UpdateEmailAddress,
} from '../@types/prisonRegister'
import { moorlandPrison } from '../../integration_tests/mockApis/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('Prison Register service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let prisonRegisterService: PrisonRegisterService
  let fakePrisonRegister: nock.Scope

  beforeEach(() => {
    fakePrisonRegister = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getPrisonsWithFilter', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/prisons/search').reply(200, [])

      await prisonRegisterService.getPrisonsWithFilter({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('is ok if there are no prisons', async () => {
      fakePrisonRegister.get('/prisons/search').reply(200, [])

      const result = await prisonRegisterService.getPrisonsWithFilter({}, {})

      expect(result).toEqual([])
    })

    it('will return all prisons with filter', async () => {
      fakePrisonRegister
        .get('/prisons/search?active=true&textSearch=ALI')
        .reply(200, [data.prison({}), data.prison({})])

      const result = await prisonRegisterService.getPrisonsWithFilter({}, { active: true, textSearch: 'ALI' })

      expect(result).toHaveLength(2)
    })
  })

  describe('getPrison', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/prisons/id/ALI').reply(200, [])

      await prisonRegisterService.getPrison({ username: 'tommy' }, 'ALI')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return the prison', async () => {
      fakePrisonRegister.get('/prisons/id/ALI').reply(200, data.prison({}))

      const result = await prisonRegisterService.getPrison({}, 'ALI')

      expect(result.prisonId).toEqual('ALI')
    })

    it('will throw error when not found', async () => {
      fakePrisonRegister.get('/prisons/id/ALI').reply(404, {
        status: 404,
        developerMessage: 'Prison ALI not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getPrison({}, 'ALI')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })

  describe('updatePrisonDetails', () => {
    let updatedPrison: UpdatePrison
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister.get('/prisons/id/MDI').reply(200, data.prison({ active: false }))
      fakePrisonRegister
        .put('/prison-maintenance/id/MDI', body => {
          updatedPrison = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await prisonRegisterService.updatePrisonDetails(
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
      await prisonRegisterService.updatePrisonDetails(
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister.get('/prisons/id/MDI').reply(200, moorlandPrison)
      fakePrisonRegister
        .put('/prison-maintenance/id/MDI', body => {
          updatedPrison = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await prisonRegisterService.updateActivePrisonMarker({ username: 'tommy' }, 'MDI', true)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send all data back with active marker now false', async () => {
      await prisonRegisterService.updateActivePrisonMarker({ username: 'tommy' }, 'MDI', false)

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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakePrisonRegister.get('/prisons/id/MDI/address/21').reply(200, data.prisonAddress({}))

      await prisonRegisterService.getPrisonAddress({ username: 'tommy' }, 'MDI', '21')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the prison address when found', async () => {
      fakePrisonRegister.get('/prisons/id/MDI/address/21').reply(200, data.prisonAddress({}))

      const prisonAddress = await prisonRegisterService.getPrisonAddress({}, 'MDI', '21')

      expect(prisonAddress?.id).toEqual(21)
    })
    it('will be undefined when prison address not found', async () => {
      fakePrisonRegister.get('/prisons/id/MDI/address/66').reply(404, {
        status: 404,
        developerMessage: 'Address 66 not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getPrisonAddress({}, 'MDI', '66')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
    it('will send error when prison address not associated with prison', async () => {
      fakePrisonRegister.get('/prisons/id/MDI/address/66').reply(404, {
        status: 404,
        developerMessage: 'Address 66 not in prison MDI',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getPrisonAddress({}, 'MDI', '66')
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister
        .put('/prison-maintenance/id/MDI/address/21', body => {
          updatedPrisonAddress = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await prisonRegisterService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', prisonAddress)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send update prison address', async () => {
      await prisonRegisterService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', prisonAddress)

      expect(updatedPrisonAddress).toEqual(prisonAddress)
    })
    it('will send no attribute rather than blanks', async () => {
      const addressWithBlanks: UpdatePrisonAddress = { ...prisonAddress, addressLine1: '', county: '  ' }
      await prisonRegisterService.updatePrisonAddress({ username: 'tommy' }, 'MDI', '21', addressWithBlanks)

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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister
        .put('/prison-maintenance/id/CFI/welsh-address/21', welshPrisonAddress)
        .reply(200, welshPrisonAddress)
    })
    it('username will be used by client', async () => {
      await prisonRegisterService.updateAddressWithWelshPrisonAddress(
        { username: 'tommy' },
        'CFI',
        '21',
        welshPrisonAddress,
      )

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will send update prison address', async () => {
      await prisonRegisterService.updateAddressWithWelshPrisonAddress(
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
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
        fakePrisonRegister.post('/prison-maintenance').reply(400, {
          timestamp: '2022-03-30 10:42:59',
          status: 400,
          error: 'Bad Request',
          message: "Validation failed for object='insertPrisonDto'. Error count: 1",
          path: '/prison-maintenance',
        })

        try {
          await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)
        } catch (e) {
          expect(e.data.message).toEqual("Validation failed for object='insertPrisonDto'. Error count: 1")
        }
      })
      it('will throw error if prison failed to be added due to some of reason', async () => {
        fakePrisonRegister
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
          await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)
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

        fakePrisonRegister
          .post('/prison-maintenance', body => {
            newAddedPrison = body
            return body
          })
          .reply(200, data.prison({ prisonId: 'SHEF' }))
      })
      it('username will be used by client', async () => {
        await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })
      it('will send back success', async () => {
        const result = await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(result.success).toEqual(true)
      })
      it('prison and address will be sent together when adding', async () => {
        await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)

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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister
        .post('/prison-maintenance/id/MDI/address', body => {
          newPrisonAddress = body
          return body
        })
        .reply(200, data.prison({}))
    })
    it('username will be used by client', async () => {
      await prisonRegisterService.addPrisonAddress({ username: 'tommy' }, 'MDI', prisonAddress)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send add prison address', async () => {
      await prisonRegisterService.addPrisonAddress({ username: 'tommy' }, 'MDI', prisonAddress)

      expect(newPrisonAddress).toEqual(prisonAddress)
    })
    it('will not send blank address fields', async () => {
      const addressWithBlanks: UpdatePrisonAddress = { ...prisonAddress, addressLine1: '', county: '  ' }
      await prisonRegisterService.addPrisonAddress({ username: 'tommy' }, 'MDI', addressWithBlanks)

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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister.delete('/prison-maintenance/id/MDI/address/21').reply(200)
    })
    it('will delete prison address', async () => {
      await prisonRegisterService.deletePrisonAddress({ username: 'tommy' }, 'MDI', '21')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
  })

  describe('getCourts', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/courts').reply(200, [])

      await prisonRegisterService.getCourts({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister.get('/courts?active=true&textSearch=Sheffield').reply(200, [data.prison({}), data.prison({})])

      const result = await prisonRegisterService.getCourts({}, { active: true, textSearch: 'Sheffield' })

      expect(result).toHaveLength(2)
    })

    it('is ok if there are no courts', async () => {
      fakePrisonRegister.get('/courts').reply(200, [])

      const result = await prisonRegisterService.getCourts({}, {})

      expect(result).toEqual([])
    })

    it('will return all courts', async () => {
      fakePrisonRegister.get('/courts').reply(200, [courtData.court({}), courtData.court({})])

      const result = await prisonRegisterService.getCourts({}, {})

      expect(result).toHaveLength(2)
    })
  })

  describe('getCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/courts/id/SHFCC').reply(200, [])

      await prisonRegisterService.getCourt({ username: 'tommy' }, 'SHFCC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return a court', async () => {
      fakePrisonRegister.get('/courts/id/SHFCC').reply(200, courtData.court({ courtId: 'SHFCC' }))

      const result = await prisonRegisterService.getCourt({}, 'SHFCC')

      expect(result).toBeDefined()
      expect(result).toHaveProperty('courtId', 'SHFCC')
    })
  })

  describe('addCourtEmailAddress', () => {
    const emailAddress: EmailAddress = { address: 'sheffield.court@example.com' }
    const createdEmailAddress: AgencyEmailAddress = { id: 10000, address: 'sheffield.court@example.com' }
    let sentEmailAddress: EmailAddress

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakePrisonRegister
          .post('/courts/id/SHFCC/email-address', body => {
            sentEmailAddress = body
            return true
          })
          .reply(200, createdEmailAddress)
      })

      it('username will be used by client', async () => {
        await prisonRegisterService.addCourtEmailAddress({ username: 'tommy' }, 'SHFCC', emailAddress)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the email address in the request body', async () => {
        await prisonRegisterService.addCourtEmailAddress({}, 'SHFCC', emailAddress)

        expect(sentEmailAddress).toEqual(emailAddress)
      })

      it('will return the created email address', async () => {
        const result = await prisonRegisterService.addCourtEmailAddress({}, 'SHFCC', emailAddress)

        expect(result).toEqual(createdEmailAddress)
      })
    })

    it('will throw error when the court is not found', async () => {
      fakePrisonRegister.post('/courts/id/UNKNOWN/email-address').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(prisonRegisterService.addCourtEmailAddress({}, 'UNKNOWN', emailAddress)).rejects.toThrow('Not Found')
    })
  })

  describe('updateCourtEmailAddress', () => {
    const emailAddress: UpdateEmailAddress = { address: 'sheffield.court.updated@example.com' }
    const updatedEmailAddress: AgencyEmailAddress = { id: 10000, address: 'sheffield.court.updated@example.com' }
    let sentEmailAddress: UpdateEmailAddress

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakePrisonRegister
          .put('/courts/id/SHFCC/email-address/10000', body => {
            sentEmailAddress = body
            return true
          })
          .reply(200, updatedEmailAddress)
      })

      it('username will be used by client', async () => {
        await prisonRegisterService.updateCourtEmailAddress({ username: 'tommy' }, 'SHFCC', 10000, emailAddress)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the email address in the request body', async () => {
        await prisonRegisterService.updateCourtEmailAddress({}, 'SHFCC', 10000, emailAddress)

        expect(sentEmailAddress).toEqual(emailAddress)
      })

      it('will return the updated email address', async () => {
        const result = await prisonRegisterService.updateCourtEmailAddress({}, 'SHFCC', 10000, emailAddress)

        expect(result).toEqual(updatedEmailAddress)
      })
    })

    it('will throw error when the court is not found', async () => {
      fakePrisonRegister.put('/courts/id/UNKNOWN/email-address/10000').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(prisonRegisterService.updateCourtEmailAddress({}, 'UNKNOWN', 10000, emailAddress)).rejects.toThrow(
        'Not Found',
      )
    })
  })

  describe('deleteCourtEmailAddress', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
      fakePrisonRegister.delete('/courts/id/SHFCC/email-address/10000').reply(204)
    })

    it('will use the username to get an API token and delete the court email address', async () => {
      await prisonRegisterService.deleteCourtEmailAddress({ username: 'tommy' }, 'SHFCC', 10000)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will throw an error when the court email address is not found', async () => {
      fakePrisonRegister.delete('/courts/id/UNKNOWN/email-address/10000').reply(404, {
        status: 404,
        developerMessage: 'Court email address not found',
      })

      await expect(prisonRegisterService.deleteCourtEmailAddress({}, 'UNKNOWN', 10000)).rejects.toThrow('Not Found')
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/other-agencies').reply(200, [])

      await prisonRegisterService.getOtherAgencies({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister
        .get('/other-agencies?active=true&textSearch=Sheffield&otherAgencyTypeCodes=PECS')
        .reply(200, [agency])

      const result = await prisonRegisterService.getOtherAgencies(
        {},
        { active: true, textSearch: 'Sheffield', otherAgencyTypeCodes: ['PECS'] },
      )

      expect(result).toEqual([agency])
    })

    it('is ok if there are no other agencies', async () => {
      fakePrisonRegister.get('/other-agencies').reply(200, [])

      const result = await prisonRegisterService.getOtherAgencies({}, {})

      expect(result).toEqual([])
    })

    it('will return all other agencies', async () => {
      fakePrisonRegister.get('/other-agencies').reply(200, [agency, { ...agency, agencyId: 'LEED' }])

      const result = await prisonRegisterService.getOtherAgencies({}, {})

      expect(result).toEqual([agency, { ...agency, agencyId: 'LEED' }])
    })
  })

  describe('getOtherAgency', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/other-agencies/id/SHEF').reply(200, {})

      await prisonRegisterService.getOtherAgency({ username: 'tommy' }, 'SHEF')

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
      fakePrisonRegister.get('/other-agencies/id/SHEF').reply(200, agency)

      const result = await prisonRegisterService.getOtherAgency({}, 'SHEF')

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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/hospitals').reply(200, [])

      await prisonRegisterService.getHospitals({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister
        .get('/hospitals?active=true&textSearch=Sheffield&highSecurity=true')
        .reply(200, [{ ...hospital, highSecurity: true }])

      const result = await prisonRegisterService.getHospitals(
        {},
        { active: true, textSearch: 'Sheffield', highSecurity: true },
      )

      expect(result).toEqual([{ ...hospital, highSecurity: true }])
    })

    it('is ok if there are no hospitals', async () => {
      fakePrisonRegister.get('/hospitals').reply(200, [])

      const result = await prisonRegisterService.getHospitals({}, {})

      expect(result).toEqual([])
    })

    it('will return all hospitals', async () => {
      fakePrisonRegister.get('/hospitals').reply(200, [hospital, { ...hospital, hospitalId: 'LEEDH' }])

      const result = await prisonRegisterService.getHospitals({}, {})

      expect(result).toEqual([hospital, { ...hospital, hospitalId: 'LEEDH' }])
    })
  })

  describe('getHospital', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/hospitals/id/SHEFH').reply(200, {})

      await prisonRegisterService.getHospital({ username: 'tommy' }, 'SHEFH')

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
      fakePrisonRegister.get('/hospitals/id/SHEFH').reply(200, hospital)

      const result = await prisonRegisterService.getHospital({}, 'SHEFH')

      expect(result).toEqual(hospital)
    })

    it('will throw error when not found', async () => {
      fakePrisonRegister.get('/hospitals/id/SHEFH').reply(404, {
        status: 404,
        developerMessage: 'Hospital SHEFH not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getHospital({}, 'SHEFH')
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/probation-offices').reply(200, [])

      await prisonRegisterService.getProbationOffices({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister.get('/probation-offices?active=true&textSearch=Sheffield').reply(200, [probationOffice])

      const result = await prisonRegisterService.getProbationOffices({}, { active: true, textSearch: 'Sheffield' })

      expect(result).toEqual([probationOffice])
    })

    it('is ok if there are no probation offices', async () => {
      fakePrisonRegister.get('/probation-offices').reply(200, [])

      const result = await prisonRegisterService.getProbationOffices({}, {})

      expect(result).toEqual([])
    })

    it('will return all probation offices', async () => {
      fakePrisonRegister
        .get('/probation-offices')
        .reply(200, [probationOffice, { ...probationOffice, probationOfficeId: 'LEEDPB' }])

      const result = await prisonRegisterService.getProbationOffices({}, {})

      expect(result).toEqual([probationOffice, { ...probationOffice, probationOfficeId: 'LEEDPB' }])
    })
  })

  describe('getProbationOffice', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/probation-offices/id/SHEFPB').reply(200, {})

      await prisonRegisterService.getProbationOffice({ username: 'tommy' }, 'SHEFPB')

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
      fakePrisonRegister.get('/probation-offices/id/SHEFPB').reply(200, probationOffice)

      const result = await prisonRegisterService.getProbationOffice({}, 'SHEFPB')

      expect(result).toEqual(probationOffice)
    })

    it('will throw error when not found', async () => {
      fakePrisonRegister.get('/probation-offices/id/SHEFPB').reply(404, {
        status: 404,
        developerMessage: 'Probation office SHEFPB not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getProbationOffice({}, 'SHEFPB')
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/police-custody-suites').reply(200, [])

      await prisonRegisterService.getPoliceCustodySuites({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister.get('/police-custody-suites?active=true&textSearch=Sheffield').reply(200, [policeCustodySuite])

      const result = await prisonRegisterService.getPoliceCustodySuites({}, { active: true, textSearch: 'Sheffield' })

      expect(result).toEqual([policeCustodySuite])
    })

    it('is ok if there are no police custody suites', async () => {
      fakePrisonRegister.get('/police-custody-suites').reply(200, [])

      const result = await prisonRegisterService.getPoliceCustodySuites({}, {})

      expect(result).toEqual([])
    })

    it('will return all police custody suites', async () => {
      fakePrisonRegister
        .get('/police-custody-suites')
        .reply(200, [policeCustodySuite, { ...policeCustodySuite, policeCustodySuiteId: 'LEEDPCS' }])

      const result = await prisonRegisterService.getPoliceCustodySuites({}, {})

      expect(result).toEqual([policeCustodySuite, { ...policeCustodySuite, policeCustodySuiteId: 'LEEDPCS' }])
    })
  })

  describe('getPoliceCustodySuite', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/police-custody-suites/id/SHFPCS').reply(200, {})

      await prisonRegisterService.getPoliceCustodySuite({ username: 'tommy' }, 'SHFPCS')

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
      fakePrisonRegister.get('/police-custody-suites/id/SHFPCS').reply(200, policeCustodySuite)

      const result = await prisonRegisterService.getPoliceCustodySuite({}, 'SHFPCS')

      expect(result).toEqual(policeCustodySuite)
    })

    it('will throw error when not found', async () => {
      fakePrisonRegister.get('/police-custody-suites/id/SHFPCS').reply(404, {
        status: 404,
        developerMessage: 'Police custody suite SHFPCS not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getPoliceCustodySuite({}, 'SHFPCS')
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
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/approved-premises').reply(200, [])

      await prisonRegisterService.getAllApprovedPremises({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakePrisonRegister.get('/approved-premises?active=true&textSearch=Sheffield').reply(200, [approvedPremises])

      const result = await prisonRegisterService.getAllApprovedPremises({}, { active: true, textSearch: 'Sheffield' })

      expect(result).toEqual([approvedPremises])
    })

    it('is ok if there are no approved premises', async () => {
      fakePrisonRegister.get('/approved-premises').reply(200, [])

      const result = await prisonRegisterService.getAllApprovedPremises({}, {})

      expect(result).toEqual([])
    })

    it('will return all approved premises', async () => {
      fakePrisonRegister
        .get('/approved-premises')
        .reply(200, [approvedPremises, { ...approvedPremises, approvedPremisesId: 'LEEDAP' }])

      const result = await prisonRegisterService.getAllApprovedPremises({}, {})

      expect(result).toEqual([approvedPremises, { ...approvedPremises, approvedPremisesId: 'LEEDAP' }])
    })
  })

  describe('getApprovedPremises', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakePrisonRegister.get('/approved-premises/id/SHEFAP').reply(200, {})

      await prisonRegisterService.getApprovedPremises({ username: 'tommy' }, 'SHEFAP')

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
      fakePrisonRegister.get('/approved-premises/id/SHEFAP').reply(200, approvedPremises)

      const result = await prisonRegisterService.getApprovedPremises({}, 'SHEFAP')

      expect(result).toEqual(approvedPremises)
    })

    it('will throw error when not found', async () => {
      fakePrisonRegister.get('/approved-premises/id/SHEFAP').reply(404, {
        status: 404,
        developerMessage: 'Approved premises SHEFAP not found',
      })

      expect.assertions(1)
      try {
        await prisonRegisterService.getApprovedPremises({}, 'SHEFAP')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })
})
