import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import PrisonRegisterService from './prisonRegisterService'
import TokenStore from '../data/tokenStore'
import data from '../routes/testutils/mockPrisonData'
import { InsertPrison, UpdatePrison, UpdatePrisonAddress } from '../@types/prisonRegister'
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
        'yes',
        true,
        false,
        []
      )

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })
    it('will send current active marker with request', async () => {
      await prisonRegisterService.updatePrisonDetails(
        { username: 'tommy' },
        'MDI',
        'HMP Moorland Updated',
        'yes',
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
        prisonName: 'Sheffield Prison',
        prisonTypes: ['HMP'],
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

        const result = await prisonRegisterService.addPrison({ username: 'tommy' }, addPrisonRequest)

        expect(result).toEqual({
          success: false,
          errorMessage: "Validation failed for object='insertPrisonDto'. Error count: 1",
        })
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
})
