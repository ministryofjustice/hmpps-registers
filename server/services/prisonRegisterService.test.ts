import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import PrisonRegisterService from './prisonRegisterService'
import TokenStore from '../data/tokenStore'
import data from '../routes/testutils/mockPrisonData'
import { UpdatePrison } from '../@types/prisonRegister'

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
      await prisonRegisterService.updatePrisonDetails({ username: 'tommy' }, 'MDI', 'HMP Moorland')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send current active marker with request', async () => {
      await prisonRegisterService.updatePrisonDetails({ username: 'tommy' }, 'MDI', 'HMP Moorland Updated')

      expect(updatedPrison).toEqual(
        expect.objectContaining({
          prisonName: 'HMP Moorland Updated',
          active: false,
        })
      )
    })
  })
})
