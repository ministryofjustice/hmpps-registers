import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import CourtRegisterService from './courtRegisterService'
import config from '../config'

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
        {
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          courtType: 'CROWN',
          active: true,
        },
        {
          courtId: 'SHFMC',
          courtName: 'Sheffield Magistrates Court',
          courtDescription: 'Sheffield Magistrates Court - Yorkshire',
          courtType: 'MAGISTRATES',
          active: false,
        },
      ])

      const result = await courtRegisterService.getAllCourts({})

      expect(result.courts).toHaveLength(2)
    })
  })
})
