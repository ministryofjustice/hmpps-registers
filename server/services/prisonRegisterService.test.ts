import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import PrisonRegisterService from './prisonRegisterService'
import TokenStore from '../data/tokenStore'
import data from '../routes/testutils/mockPrisonData'
import { UpdatePrison, UpdatePrisonAddress } from '../@types/prisonRegister'
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
      await prisonRegisterService.updatePrisonDetails({ username: 'tommy' }, 'MDI', 'HMP Moorland', true, false, [])

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send current active marker with request', async () => {
      await prisonRegisterService.updatePrisonDetails(
        { username: 'tommy' },
        'MDI',
        'HMP Moorland Updated',
        true,
        false,
        ['HMP']
      )

      expect(updatedPrison).toEqual(
        expect.objectContaining({
          prisonName: 'HMP Moorland Updated',
          active: false,
          male: true,
          female: false,
          prisonTypes: ['HMP'],
        })
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
        })
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
})
