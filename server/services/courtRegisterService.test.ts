import nock from 'nock'

import { Court, UpdateCourt } from 'courtRegister'
import HmppsAuthClient from '../data/hmppsAuthClient'
import CourtRegisterService from './courtRegisterService'
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
        courtType: 'CROWN',
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
})
