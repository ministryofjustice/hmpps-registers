import nock from 'nock'

import {
  Court,
  InsertCourt,
  InsertCourtBuilding,
  InsertCourtBuildingContact,
  UpdateCourt,
  UpdateCourtBuilding,
} from '../@types/courtRegister'
import HmppsAuthClient from '../data/hmppsAuthClient'
import CourtRegisterService, { AddCourt } from './courtRegisterService'
import config from '../config'
import data from '../routes/testutils/mockData'
import TokenStore from '../data/tokenStore'

jest.mock('../data/hmppsAuthClient')

describe('Court Register service', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let courtRegisterService: CourtRegisterService
  let fakeCourtRegister: nock.Scope

  beforeEach(() => {
    fakeCourtRegister = nock(config.apis.courtRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllCourts', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/all').reply(200, [])

      await courtRegisterService.getAllCourts({ username: 'tommy' })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('is ok if there are no courts', async () => {
      fakeCourtRegister.get('/courts/all').reply(200, [])

      const result = await courtRegisterService.getAllCourts({})

      expect(result.courts).toEqual([])
    })
    it('will return all courts', async () => {
      fakeCourtRegister.get('/courts/all').reply(200, [
        data.court({
          courtId: 'SHFCC',
        }),
        data.court({
          courtId: 'SHFMC',
        }),
      ])

      const result = await courtRegisterService.getAllCourts({})

      expect(result.courts).toHaveLength(2)
    })
  })
  describe('getPageOfCourts', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister
        .get('/courts/paged?page=0&size=3&sort=courtName')
        .reply(200, { content: [], last: false, totalPages: 0, totalElements: 0, first: true, empty: true })

      await courtRegisterService.getPageOfCourts({ username: 'tommy' }, 0, 3, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('is ok if there are no courts', async () => {
      fakeCourtRegister.get('/courts/paged?page=0&size=3&sort=courtName').reply(200, {
        content: [],
        last: true,
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 3,
        first: true,
        numberOfElements: 0,
        empty: true,
      })

      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, {})

      expect(result.content).toEqual([])
      expect(result.last).toEqual(true)
      expect(result.totalPages).toEqual(0)
      expect(result.totalElements).toEqual(0)
      expect(result.number).toEqual(0)
      expect(result.size).toEqual(3)
      expect(result.first).toEqual(true)
      expect(result.numberOfElements).toEqual(0)
      expect(result.empty).toEqual(true)
    })
    it('will return page of courts', async () => {
      fakeCourtRegister.get('/courts/paged?page=0&size=3&sort=courtName').reply(200, {
        content: [
          data.court({
            courtId: 'SHFCC',
          }),
          data.court({
            courtId: 'SHFMC',
          }),
          data.court({
            courtId: 'SHFYC',
          }),
        ],
        last: false,
        totalPages: 2,
        totalElements: 4,
        number: 0,
        size: 3,
        first: true,
        numberOfElements: 3,
        empty: false,
      })

      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, {})

      expect(result.content).toHaveLength(3)
      expect(result.last).toEqual(false)
      expect(result.totalPages).toEqual(2)
      expect(result.totalElements).toEqual(4)
      expect(result.number).toEqual(0)
      expect(result.size).toEqual(3)
      expect(result.first).toEqual(true)
      expect(result.numberOfElements).toEqual(3)
      expect(result.empty).toEqual(false)
    })
    it('will request the active filter', async () => {
      fakeCourtRegister.get('/courts/paged?page=0&size=3&sort=courtName&active=true').reply(200, {
        content: [
          data.court({
            courtId: 'SHFCC',
          }),
        ],
        last: false,
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 1,
        first: true,
        numberOfElements: 1,
        empty: false,
      })
      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, { active: true })

      expect(result.content).toHaveLength(1)
    })
    it('will request a single courtTypeIds filter', async () => {
      fakeCourtRegister.get('/courts/paged?page=0&size=3&sort=courtName&courtTypeIds=COU').reply(200, {
        content: [
          data.court({
            courtId: 'SHFCC',
          }),
        ],
        last: false,
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 1,
        first: true,
        numberOfElements: 1,
        empty: false,
      })
      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, { courtTypeIds: ['COU'] })

      expect(result.content).toHaveLength(1)
    })
    it('will request multiple courtTypeIds filter', async () => {
      fakeCourtRegister.get('/courts/paged?page=0&size=3&sort=courtName&courtTypeIds=COU&courtTypeIds=CRO').reply(200, {
        content: [
          data.court({
            courtId: 'SHFCC',
          }),
        ],
        last: false,
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 1,
        first: true,
        numberOfElements: 1,
        empty: false,
      })
      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, { courtTypeIds: ['COU', 'CRO'] })

      expect(result.content).toHaveLength(1)
    })
    it('will request active and multiple courtTypeIds filter', async () => {
      fakeCourtRegister
        .get('/courts/paged?page=0&size=3&sort=courtName&active=false&courtTypeIds=COU&courtTypeIds=CRO')
        .reply(200, {
          content: [
            data.court({
              courtId: 'SHFCC',
            }),
          ],
          last: false,
          totalPages: 1,
          totalElements: 1,
          number: 0,
          size: 1,
          first: true,
          numberOfElements: 1,
          empty: false,
        })
      const result = await courtRegisterService.getPageOfCourts({}, 0, 3, {
        active: false,
        courtTypeIds: ['COU', 'CRO'],
      })

      expect(result.content).toHaveLength(1)
    })
  })
  describe('getCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(200, data.court({}))

      await courtRegisterService.getCourt({ username: 'tommy' }, 'SHFCC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the court', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(
        200,
        data.court({
          courtId: 'SHFCC',
        })
      )

      const court = await courtRegisterService.getCourt({}, 'SHFCC')

      expect(court.courtId).toEqual('SHFCC')
    })
    it('will throw error when not found', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(404, {
        status: 404,
        developerMessage: 'Court SHFCC not found',
      })
      expect.assertions(1)
      try {
        await courtRegisterService.getCourt({}, 'SHFCC')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })
  describe('findCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(200, data.court({}))

      await courtRegisterService.findCourt({ username: 'tommy' }, 'SHFCC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the court when found', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(
        200,
        data.court({
          courtId: 'SHFCC',
        })
      )

      const court = await courtRegisterService.findCourt({}, 'SHFCC')

      expect(court?.courtId).toEqual('SHFCC')
    })
    it('will be undefined when court not found', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(404, {
        status: 404,
        developerMessage: 'Court SHFCC not found',
      })

      const court = await courtRegisterService.findCourt({}, 'SHFCC')

      expect(court).toBeFalsy()
    })
  })
  describe('findCourtBuilding', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/buildings/sub-code/SHFAN').reply(200, data.courtBuilding({}))

      await courtRegisterService.findCourtBuilding({ username: 'tommy' }, 'SHFAN')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the court building when found', async () => {
      fakeCourtRegister.get('/courts/buildings/sub-code/SHFAN').reply(
        200,
        data.courtBuilding({
          courtId: 'SHFCC',
          id: 1,
          subCode: 'SHFAN',
        })
      )

      const courtBuilding = await courtRegisterService.findCourtBuilding({}, 'SHFAN')

      expect(courtBuilding?.courtId).toEqual('SHFCC')
      expect(courtBuilding?.id).toEqual(1)
      expect(courtBuilding?.subCode).toEqual('SHFAN')
    })
    it('will be undefined when court building not found', async () => {
      fakeCourtRegister.get('/courts/buildings/sub-code/SHFAN').reply(404, {
        status: 404,
        developerMessage: 'Building SHFAN not found',
      })

      const court = await courtRegisterService.findCourtBuilding({}, 'SHFAN')

      expect(court).toBeFalsy()
    })
  })
  describe('findCourtMainBuilding', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/id/SHFMC/buildings/main').reply(200, data.courtBuilding({}))

      await courtRegisterService.findMainCourtBuilding({ username: 'tommy' }, 'SHFMC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the court building when found', async () => {
      fakeCourtRegister.get('/courts/id/SHFMC/buildings/main').reply(
        200,
        data.courtBuilding({
          courtId: 'SHFMC',
          id: 1,
        })
      )

      const courtBuilding = await courtRegisterService.findMainCourtBuilding({}, 'SHFMC')

      expect(courtBuilding?.courtId).toEqual('SHFMC')
      expect(courtBuilding?.id).toEqual(1)
    })
    it('will be undefined when court building not found', async () => {
      fakeCourtRegister.get('/courts/id/SHFMC/buildings/main').reply(404, {
        status: 404,
        developerMessage: 'Building SHFMC not found',
      })

      const court = await courtRegisterService.findMainCourtBuilding({}, 'SHFMC')

      expect(court).toBeFalsy()
    })
  })
  describe('updateActiveMarker', () => {
    let updatedCourt: UpdateCourt
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
      fakeCourtRegister.get('/courts/id/SHFCC').reply(200, data.court({}))
      fakeCourtRegister
        .put('/court-maintenance/id/SHFCC', body => {
          updatedCourt = body
          return body
        })
        .reply(200, data.court({}))
    })
    it('username will be used by client', async () => {
      await courtRegisterService.updateActiveMarker({ username: 'tommy' }, 'SHFCC', true)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send all data back with active marker now true', async () => {
      const courtBeforeUpdate: Court = data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        type: { courtType: 'CROWN', courtName: 'Crown' },
        active: false,
      })
      fakeCourtRegister.get('/courts/id/SHFCC').reply(200, courtBeforeUpdate)

      await courtRegisterService.updateActiveMarker({ username: 'tommy' }, 'SHFCC', true)

      expect(updatedCourt).toEqual(
        expect.objectContaining({
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          courtType: 'CROWN',
          active: true,
        })
      )
    })
  })
  describe('updateCourtDetails', () => {
    let updatedCourt: UpdateCourt
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
      fakeCourtRegister.get('/courts/id/SHFCC').reply(200, data.court({ active: false }))
      fakeCourtRegister
        .put('/court-maintenance/id/SHFCC', body => {
          updatedCourt = body
          return body
        })
        .reply(200, data.court({}))
    })
    it('username will be used by client', async () => {
      await courtRegisterService.updateCourtDetails({ username: 'tommy' }, 'SHFCC', 'Sheffield Crown Court', 'CRN', '')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send current active marker with request', async () => {
      await courtRegisterService.updateCourtDetails({ username: 'tommy' }, 'SHFCC', 'Sheffield Crown Court', 'CRN', '')

      expect(updatedCourt).toEqual(
        expect.objectContaining({
          courtName: 'Sheffield Crown Court',
          courtType: 'CRN',
          active: false,
        })
      )
    })
  })
  describe('updateCourtBuilding', () => {
    let updatedCourtBuilding: UpdateCourtBuilding
    const courtBuilding = {
      buildingName: 'Crown Square',
      street: 'High Street',
      locality: 'City Centre',
      town: 'Sheffield',
      subCode: 'SHFAN',
      postcode: 'S1 2BJ',
      county: 'South Yorkshire',
      country: 'England',
    }
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
      fakeCourtRegister
        .put('/court-maintenance/id/SHFCC/buildings/1', body => {
          updatedCourtBuilding = body
          return body
        })
        .reply(200, data.court({}))
    })
    it('username will be used by client', async () => {
      await courtRegisterService.updateCourtBuilding({ username: 'tommy' }, 'SHFCC', '1', courtBuilding)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send update court building', async () => {
      await courtRegisterService.updateCourtBuilding({ username: 'tommy' }, 'SHFCC', '1', courtBuilding)

      expect(updatedCourtBuilding).toEqual(courtBuilding)
    })
    it('will send no attribute rather than blanks', async () => {
      const buildingWithBlanks: UpdateCourtBuilding = { ...courtBuilding, locality: '', subCode: '  ' }
      await courtRegisterService.updateCourtBuilding({ username: 'tommy' }, 'SHFCC', '1', buildingWithBlanks)

      expect(updatedCourtBuilding).toEqual({
        buildingName: 'Crown Square',
        street: 'High Street',
        town: 'Sheffield',
        postcode: 'S1 2BJ',
        county: 'South Yorkshire',
        country: 'England',
      })
    })
  })
  describe('getCourtTypes', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/types').reply(200, [])

      await courtRegisterService.getCourtTypes({ username: 'tommy' })

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return all court types', async () => {
      fakeCourtRegister.get('/courts/types').reply(200, [
        {
          courtType: 'COU',
          courtName: 'County Court/County Divorce Ct',
        },
        {
          courtType: 'YOU',
          courtName: 'Youth Court',
        },
      ])

      const result = await courtRegisterService.getCourtTypes({})

      expect(result).toHaveLength(2)
    })
  })
  describe('addCourt', () => {
    let addCourtRequest: AddCourt

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
      addCourtRequest = {
        court: {
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtType: 'CRN',
          courtDescription: 'Main court',
          active: true,
        },
        building: {
          buildingName: 'Crown Square',
          street: '1 High Street',
          locality: 'Main center',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          county: 'South Yorkshire',
          country: 'England',
        },
        contacts: [
          {
            type: 'TEL',
            detail: '0114 555 6666',
          },
          {
            type: 'FAX',
            detail: '0114 777 8888',
          },
        ],
      }
    })
    describe('on failure', () => {
      it('will send back error if court failed to be added due to bad request', async () => {
        fakeCourtRegister.post('/court-maintenance').reply(400, {
          timestamp: '2021-03-30 10:42:59',
          status: 400,
          error: 'Bad Request',
          message: "Validation failed for object='insertCourtDto'. Error count: 1",
          path: '/court-maintenance',
        })

        const result = await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(result).toEqual({
          success: false,
          errorMessage: "Validation failed for object='insertCourtDto'. Error count: 1",
        })
      })
      it('will throw error if court failed to be added due to some of reason', async () => {
        fakeCourtRegister
          .post('/court-maintenance')
          .reply(500, {
            timestamp: '2021-03-30 10:42:59',
            status: 500,
            error: 'Bad Request',
            message: 'Internal Error',
            path: '/court-maintenance',
          })
          .persist()

        expect.assertions(1)
        try {
          await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)
        } catch (e) {
          expect(e.message).toEqual('Internal Server Error')
        }
      })
    })

    describe('on success', () => {
      let newAddedCourt: InsertCourt | null
      let newAddedBuilding: InsertCourtBuilding | null
      let newAddedBuildingContactTelephone: InsertCourtBuildingContact | null
      let newAddedBuildingContactFax: InsertCourtBuildingContact | null
      beforeEach(() => {
        addCourtRequest = {
          court: {
            courtId: 'SHFCC',
            courtName: 'Sheffield Crown Court',
            courtType: 'CRN',
            courtDescription: 'Main court',
            active: true,
          },
          building: {
            buildingName: 'Crown Square',
            street: '1 High Street',
            locality: 'Main center',
            town: 'Sheffield',
            postcode: 'S1 2BJ',
            county: 'South Yorkshire',
            country: 'England',
          },
          contacts: [
            {
              type: 'TEL',
              detail: '0114 555 6666',
            },
            {
              type: 'FAX',
              detail: '0114 777 8888',
            },
          ],
        }
        newAddedCourt = null
        newAddedBuilding = null
        newAddedBuildingContactTelephone = null
        newAddedBuildingContactFax = null

        fakeCourtRegister
          .post('/court-maintenance', body => {
            newAddedCourt = body
            return body
          })
          .reply(200, data.court({ courtId: 'SHFCC' }))
        fakeCourtRegister
          .post('/court-maintenance/id/SHFCC/buildings', body => {
            newAddedBuilding = body
            return body
          })
          .reply(200, { id: 123 })
        fakeCourtRegister
          .post('/court-maintenance/id/SHFCC/buildings/123/contacts', body => {
            newAddedBuildingContactTelephone = body
            return body
          })
          .reply(200, { id: 321 })
        fakeCourtRegister
          .post('/court-maintenance/id/SHFCC/buildings/123/contacts', body => {
            newAddedBuildingContactFax = body
            return body
          })
          .reply(200, { id: 322 })
      })
      it('username will be used by client', async () => {
        await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })
      it('will send back success', async () => {
        const result = await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(result.success).toEqual(true)
      })
      it('court will be sent when adding', async () => {
        await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(newAddedCourt).toEqual({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtType: 'CRN',
          courtDescription: 'Main court',
          active: true,
        })
      })
      it('court building will be sent when adding', async () => {
        await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(newAddedBuilding).toEqual({
          buildingName: 'Crown Square',
          street: '1 High Street',
          locality: 'Main center',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          county: 'South Yorkshire',
          country: 'England',
        })
      })
      it('both telephone and fax sent when both present will be sent when adding', async () => {
        await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(newAddedBuildingContactTelephone).toEqual({
          type: 'TEL',
          detail: '0114 555 6666',
        })
        expect(newAddedBuildingContactFax).toEqual({
          type: 'FAX',
          detail: '0114 777 8888',
        })
      })
      it('ony telephone sent when fax not present will be sent when adding', async () => {
        addCourtRequest.contacts = [
          {
            type: 'TEL',
            detail: '0114 555 6666',
          },
        ]
        await courtRegisterService.addCourt({ username: 'tommy' }, addCourtRequest)

        expect(newAddedBuildingContactTelephone).toEqual({
          type: 'TEL',
          detail: '0114 555 6666',
        })
        expect(newAddedBuildingContactFax).toBeNull()
      })
    })
  })
  describe('getCourtBuilding', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(200, data.courtBuilding({}))

      await courtRegisterService.getCourtBuilding({ username: 'tommy' }, 'SHFCC', '1')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will return the court building', async () => {
      fakeCourtRegister
        .get('/courts/id/SHFCC/buildings/id/1')
        .reply(200, data.courtBuilding({ id: 1, courtId: 'SHFCC' }))

      const courtBuilding = await courtRegisterService.getCourtBuilding({ username: 'tommy' }, 'SHFCC', '1')

      expect(courtBuilding.courtId).toEqual('SHFCC')
      expect(courtBuilding.id).toEqual(1)
    })
    it('will throw error when not found', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(404, {
        status: 404,
        developerMessage: 'Building 1 not found',
      })
      expect.assertions(1)
      try {
        await courtRegisterService.getCourtBuilding({ username: 'tommy' }, 'SHFCC', '1')
      } catch (e) {
        expect(e.message).toBe('Not Found')
      }
    })
  })
  describe('addCourtBuilding', () => {
    let newCourtBuilding: InsertCourtBuilding
    const courtBuilding = {
      buildingName: 'Crown Square',
      street: 'High Street',
      locality: 'City Centre',
      town: 'Sheffield',
      subCode: 'SHFAN',
      postcode: 'S1 2BJ',
      county: 'South Yorkshire',
      country: 'England',
    }
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
      fakeCourtRegister
        .post('/court-maintenance/id/SHFCC/buildings', body => {
          newCourtBuilding = body
          return body
        })
        .reply(200, data.courtBuilding({}))
    })
    it('username will be used by client', async () => {
      await courtRegisterService.addCourtBuilding({ username: 'tommy' }, 'SHFCC', courtBuilding)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send new court building', async () => {
      await courtRegisterService.addCourtBuilding({ username: 'tommy' }, 'SHFCC', courtBuilding)

      expect(newCourtBuilding).toEqual(courtBuilding)
    })
    it('will not send attribute rather than blanks', async () => {
      const buildingWithBlanks: InsertCourtBuilding = { ...courtBuilding, locality: '', subCode: '  ' }
      await courtRegisterService.addCourtBuilding({ username: 'tommy' }, 'SHFCC', buildingWithBlanks)

      expect(newCourtBuilding).toEqual({
        buildingName: 'Crown Square',
        street: 'High Street',
        town: 'Sheffield',
        postcode: 'S1 2BJ',
        county: 'South Yorkshire',
        country: 'England',
      })
    })
  })
  describe('updateCourtBuildingContacts', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(200, data.courtBuilding({}))
      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [])

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('should update existing contact when changed', async () => {
      const scope = fakeCourtRegister
        .put('/court-maintenance/id/SHFCC/buildings/1/contacts/1', {
          detail: '0114 555 1234',
          type: 'FAX',
        })
        .reply(200, data.courtBuildingContact({}))

      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(
        200,
        data.courtBuilding({
          contacts: [
            {
              id: 1,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 1234',
              type: 'TEL',
            },
          ],
        })
      )

      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [
        {
          id: '1',
          detail: '0114 555 1234',
          type: 'FAX',
        },
      ])

      expect(scope.isDone()).toBe(true)
    })
    it('should update nothing if existing contact has not changed', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(
        200,
        data.courtBuilding({
          contacts: [
            {
              id: 1,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 1234',
              type: 'TEL',
            },
          ],
        })
      )

      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [
        {
          id: '1',
          detail: '0114 555 1234',
          type: 'TEL',
        },
      ])

      // expect no updates/deletes/inserts
      expect(fakeCourtRegister.isDone()).toBe(true)
    })
    it('should add contact when new', async () => {
      const scope = fakeCourtRegister
        .post('/court-maintenance/id/SHFCC/buildings/1/contacts', { detail: '0114 555 1234', type: 'FAX' })
        .reply(200, data.courtBuildingContact({}))

      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(
        200,
        data.courtBuilding({
          contacts: [],
        })
      )

      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [
        {
          detail: '0114 555 1234',
          type: 'FAX',
        },
      ])

      expect(scope.isDone()).toBe(true)
    })
    it('should delete contact when no longer present', async () => {
      const scope = fakeCourtRegister
        .delete('/court-maintenance/id/SHFCC/buildings/1/contacts/1')
        .reply(200, data.courtBuildingContact({}))

      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(
        200,
        data.courtBuilding({
          contacts: [
            {
              id: 1,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 1234',
              type: 'TEL',
            },
          ],
        })
      )

      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [])

      expect(scope.isDone()).toBe(true)
    })
    it('can delete, insert and update all in one go', async () => {
      const scope = fakeCourtRegister
        .put('/court-maintenance/id/SHFCC/buildings/1/contacts/1', { detail: '0114 999 1111', type: 'TEL' })
        .reply(200, data.courtBuildingContact({}))
        .post('/court-maintenance/id/SHFCC/buildings/1/contacts', {
          detail: '0114 999 2222',
          type: 'TEL',
        })
        .reply(200, data.courtBuildingContact({}))
        .delete('/court-maintenance/id/SHFCC/buildings/1/contacts/2')
        .reply(200, data.courtBuildingContact({}))

      fakeCourtRegister.get('/courts/id/SHFCC/buildings/id/1').reply(
        200,
        data.courtBuilding({
          contacts: [
            {
              id: 1,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 1111',
              type: 'TEL',
            },
            {
              id: 2,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 2222',
              type: 'TEL',
            },
            {
              id: 3,
              courtId: 'SHFCC',
              buildingId: 1,
              detail: '0114 555 3333',
              type: 'TEL',
            },
          ],
        })
      )

      await courtRegisterService.updateCourtBuildingContacts({ username: 'tommy' }, 'SHFCC', '1', [
        {
          id: '1',
          detail: '0114 999 1111',
          type: 'TEL',
        },
        {
          detail: '0114 999 2222',
          type: 'TEL',
        },
        {
          id: '3',
          detail: '0114 555 3333',
          type: 'TEL',
        },
      ])

      expect(scope.isDone()).toBe(true)
    })
  })
})
