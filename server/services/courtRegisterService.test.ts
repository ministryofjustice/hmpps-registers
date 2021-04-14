import nock from 'nock'

import {
  Court,
  InsertCourt,
  InsertCourtBuilding,
  InsertCourtBuildingContact,
  UpdateCourt,
} from '../@types/courtRegister'
import HmppsAuthClient from '../data/hmppsAuthClient'
import CourtRegisterService, { AddCourt } from './courtRegisterService'
import config from '../config'
import data from '../routes/testutils/mockData'

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
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
      courtRegisterService = new CourtRegisterService(hmppsAuthClient)
    })
    it('username will be used by client', async () => {
      fakeCourtRegister
        .get('/courts/all/paged?page=0&size=3&sort=courtName')
        .reply(200, { content: [], last: false, totalPages: 0, totalElements: 0, first: true, empty: true })

      await courtRegisterService.getPageOfCourts({ username: 'tommy' }, 0, 3)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('is ok if there are no courts', async () => {
      fakeCourtRegister.get('/courts/all/paged?page=0&size=3&sort=courtName').reply(200, {
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

      const result = await courtRegisterService.getPageOfCourts({}, 0, 3)

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
      fakeCourtRegister.get('/courts/all/paged?page=0&size=3&sort=courtName').reply(200, {
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

      const result = await courtRegisterService.getPageOfCourts({}, 0, 3)

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
  })
  describe('getCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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

      expect(court.courtId).toEqual('SHFCC')
    })
    it('will null when court not found', async () => {
      fakeCourtRegister.get('/courts/id/SHFCC').reply(404, {
        status: 404,
        developerMessage: 'Court SHFCC not found',
      })

      const court = await courtRegisterService.findCourt({}, 'SHFCC')

      expect(court).toBeFalsy()
    })
  })
  describe('updateActiveMarker', () => {
    let updatedCourt: UpdateCourt
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          courtType: 'CROWN',
          active: true,
        })
      )
    })
  })
  describe('getCourtTypes', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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
      hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
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
      let newAddedCourt: InsertCourt
      let newAddedBuilding: InsertCourtBuilding
      let newAddedBuildingContactTelephone: InsertCourtBuildingContact
      let newAddedBuildingContactFax: InsertCourtBuildingContact
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
})
