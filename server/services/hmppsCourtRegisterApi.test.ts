import nock from 'nock'

import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import HMPPSAgencyRegisterApi from './hmppsAgencyRegisterApi'
import TokenStore from '../data/tokenStore/redisTokenStore'
import courtData from '../routes/testutils/mockCourtData'
import {
  AgencyAddress,
  AgencyEmailAddress,
  AgencyPhoneNumber,
  CreateCourt,
  EmailAddress,
  PhoneNumber,
  UpdateCourt,
  UpdateEmailAddress,
  UpdatePrisonAddress,
} from '../@types/prisonRegister'

jest.mock('../data/hmppsAuthClient')

describe('HMPPS Court Register API', () => {
  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
  let fakeHmppsAgencyRegisterApi: nock.Scope

  beforeEach(() => {
    fakeHmppsAgencyRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('deleteCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('uses the authenticated user context and deletes the selected court', async () => {
      const scope = fakeHmppsAgencyRegisterApi.delete('/courts/id/SHFCC').reply(204)

      await hmppsAgencyRegisterApiService.deleteCourt({ username: 'tommy' }, 'SHFCC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('encodes the court ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.delete('/courts/id/a%2Fb').reply(204)

      await hmppsAgencyRegisterApiService.deleteCourt({}, 'a/b')

      expect(scope.isDone()).toBe(true)
    })

    it.each([401, 403, 404, 500])('propagates API failures: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .delete('/courts/id/SHFCC')
        .times(status === 500 ? 3 : 1)
        .reply(status, {})

      await expect(hmppsAgencyRegisterApiService.deleteCourt({}, 'SHFCC')).rejects.toMatchObject({ status })
    })

    it('propagates authentication failures', async () => {
      hmppsAuthClient.getApiClientToken.mockRejectedValueOnce(new Error('Authentication unavailable'))

      await expect(hmppsAgencyRegisterApiService.deleteCourt({}, 'SHFCC')).rejects.toThrow('Authentication unavailable')
    })
  })

  describe('getCourts', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/courts').reply(200, [])

      await hmppsAgencyRegisterApiService.getCourts({ username: 'tommy' }, {})

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will pass filter to service', async () => {
      fakeHmppsAgencyRegisterApi
        .get('/courts?active=true&textSearch=Sheffield')
        .reply(200, [courtData.court({}), courtData.court({})])

      const result = await hmppsAgencyRegisterApiService.getCourts({}, { active: true, textSearch: 'Sheffield' })

      expect(result).toHaveLength(2)
    })

    it('is ok if there are no courts', async () => {
      fakeHmppsAgencyRegisterApi.get('/courts').reply(200, [])

      const result = await hmppsAgencyRegisterApiService.getCourts({}, {})

      expect(result).toEqual([])
    })

    it('will return all courts', async () => {
      fakeHmppsAgencyRegisterApi.get('/courts').reply(200, [courtData.court({}), courtData.court({})])

      const result = await hmppsAgencyRegisterApiService.getCourts({}, {})

      expect(result).toHaveLength(2)
    })
  })

  describe('getCourt', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('username will be used by client', async () => {
      fakeHmppsAgencyRegisterApi.get('/courts/id/SHFCC').reply(200, [])

      await hmppsAgencyRegisterApiService.getCourt({ username: 'tommy' }, 'SHFCC')

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will return a court', async () => {
      fakeHmppsAgencyRegisterApi.get('/courts/id/SHFCC').reply(200, courtData.court({ courtId: 'SHFCC' }))

      const result = await hmppsAgencyRegisterApiService.getCourt({}, 'SHFCC')

      expect(result).toBeDefined()
      expect(result).toHaveProperty('courtId', 'SHFCC')
    })
  })

  describe('addCourtAddress', () => {
    const address: UpdatePrisonAddress = {
      addressLine1: '1 High Street',
      addressLine2: '',
      town: 'Sheffield',
      county: '  ',
      postcode: 'S1 2BJ',
      country: 'England',
    }
    const createdAddress: AgencyAddress = { id: 10000, addressLine1: '1 High Street', town: 'Sheffield' }
    let sentAddress: UpdatePrisonAddress

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .post('/courts/id/SHFCC/address', body => {
            sentAddress = body
            return true
          })
          .reply(201, createdAddress)
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.addCourtAddress({ username: 'tommy' }, 'SHFCC', address)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the address and omit blank optional fields', async () => {
        await hmppsAgencyRegisterApiService.addCourtAddress({}, 'SHFCC', address)

        expect(sentAddress).toEqual({
          addressLine1: '1 High Street',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          country: 'England',
        })
      })

      it('will return success when the address is created', async () => {
        const result = await hmppsAgencyRegisterApiService.addCourtAddress({}, 'SHFCC', address)

        expect(result).toEqual({ success: true })
      })
    })

    it('will throw error when the court is not found', async () => {
      fakeHmppsAgencyRegisterApi.post('/courts/id/UNKNOWN/address').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(hmppsAgencyRegisterApiService.addCourtAddress({}, 'UNKNOWN', address)).rejects.toThrow('Not Found')
    })
  })

  describe('updateCourtAddress', () => {
    const address: UpdatePrisonAddress = {
      addressLine1: '1 High Street',
      addressLine2: 'City Centre',
      town: 'Sheffield',
      county: 'South Yorkshire',
      postcode: 'S1 2BJ',
      country: 'England',
    }
    const updatedAddress: AgencyAddress = { id: 2, ...address }

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('will use the username and send the updated address to the selected address endpoint', async () => {
      const scope = fakeHmppsAgencyRegisterApi.put('/courts/id/SHFCC/address/2', address).reply(200, updatedAddress)

      const result = await hmppsAgencyRegisterApiService.updateCourtAddress({ username: 'tommy' }, 'SHFCC', 2, address)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('will omit blank optional fields when clearing them', async () => {
      const scope = fakeHmppsAgencyRegisterApi
        .put('/courts/id/SHFCC/address/2', { town: 'Sheffield', postcode: 'S1 2BJ', country: 'England' })
        .reply(200, updatedAddress)

      await hmppsAgencyRegisterApiService.updateCourtAddress({}, 'SHFCC', 2, {
        ...address,
        addressLine1: '',
        addressLine2: '  ',
        county: '',
      })

      expect(scope.isDone()).toBe(true)
    })

    it.each([400, 404, 500])('will propagate API errors with status %s', async status => {
      fakeHmppsAgencyRegisterApi.put('/courts/id/SHFCC/address/2').reply(status, { status })

      await expect(hmppsAgencyRegisterApiService.updateCourtAddress({}, 'SHFCC', 2, address)).rejects.toMatchObject({
        status,
      })
    })
  })

  describe('addCourtPhoneNumber', () => {
    const phoneNumber: PhoneNumber = { number: '+44 114-555-9898' }
    const createdPhoneNumber: AgencyPhoneNumber = { id: 10000, number: phoneNumber.number }
    let sentPhoneNumber: PhoneNumber

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .post('/courts/id/SHFCC/phone-number', body => {
            sentPhoneNumber = body
            return true
          })
          .reply(201, createdPhoneNumber)
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.addCourtPhoneNumber({ username: 'tommy' }, 'SHFCC', phoneNumber)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the phone number in the request body', async () => {
        await hmppsAgencyRegisterApiService.addCourtPhoneNumber({}, 'SHFCC', phoneNumber)

        expect(sentPhoneNumber).toEqual(phoneNumber)
      })

      it('will return success when the phone number is created', async () => {
        const result = await hmppsAgencyRegisterApiService.addCourtPhoneNumber({}, 'SHFCC', phoneNumber)

        expect(result).toEqual({ success: true })
      })
    })

    it('will throw error when the court is not found', async () => {
      fakeHmppsAgencyRegisterApi.post('/courts/id/UNKNOWN/phone-number').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(hmppsAgencyRegisterApiService.addCourtPhoneNumber({}, 'UNKNOWN', phoneNumber)).rejects.toThrow(
        'Not Found',
      )
    })
  })

  describe('addCourtEmailAddress', () => {
    const emailAddress: EmailAddress = { address: 'sheffield.court@example.com' }
    const createdEmailAddress: AgencyEmailAddress = { id: 10000, address: 'sheffield.court@example.com' }
    let sentEmailAddress: EmailAddress

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .post('/courts/id/SHFCC/email-address', body => {
            sentEmailAddress = body
            return true
          })
          .reply(200, createdEmailAddress)
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.addCourtEmailAddress({ username: 'tommy' }, 'SHFCC', emailAddress)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the email address in the request body', async () => {
        await hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'SHFCC', emailAddress)

        expect(sentEmailAddress).toEqual(emailAddress)
      })

      it('will return success when the email address is created', async () => {
        const result = await hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'SHFCC', emailAddress)

        expect(result).toEqual({ success: true })
      })
    })

    it('will return the user message from a 400 response without requiring an error property', async () => {
      fakeHmppsAgencyRegisterApi.post('/courts/id/SHFCC/email-address').reply(400, {
        userMessage: 'This email address already exists',
        developerMessage: 'Duplicate email',
      })

      expect(await hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'SHFCC', emailAddress)).toEqual({
        success: false,
        userMessage: 'This email address already exists',
      })
    })

    it.each([{}, { userMessage: null }, { userMessage: '' }, { userMessage: '   ' }])(
      'will propagate a 400 response without a usable user message: %j',
      async body => {
        fakeHmppsAgencyRegisterApi.post('/courts/id/SHFCC/email-address').reply(400, body)

        await expect(
          hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'SHFCC', emailAddress),
        ).rejects.toMatchObject({
          status: 400,
        })
      },
    )

    it('will propagate a server error even when it contains a user message', async () => {
      fakeHmppsAgencyRegisterApi
        .post('/courts/id/SHFCC/email-address')
        .reply(500, { userMessage: 'Service unavailable' })

      await expect(hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'SHFCC', emailAddress)).rejects.toMatchObject(
        {
          status: 500,
        },
      )
    })

    it('will throw error when the court is not found', async () => {
      fakeHmppsAgencyRegisterApi.post('/courts/id/UNKNOWN/email-address').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(hmppsAgencyRegisterApiService.addCourtEmailAddress({}, 'UNKNOWN', emailAddress)).rejects.toThrow(
        'Not Found',
      )
    })
  })

  describe('updateCourtPhoneNumber', () => {
    const phoneNumber: PhoneNumber = { number: '+44 114-555-9898' }
    const updatedPhoneNumber: AgencyPhoneNumber = { id: 10000, number: phoneNumber.number }
    let sentPhoneNumber: PhoneNumber

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .put('/courts/id/SHFCC/phone-number/10000', body => {
            sentPhoneNumber = body
            return true
          })
          .reply(200, updatedPhoneNumber)
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.updateCourtPhoneNumber({ username: 'tommy' }, 'SHFCC', 10000, phoneNumber)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the phone number in the request body', async () => {
        await hmppsAgencyRegisterApiService.updateCourtPhoneNumber({}, 'SHFCC', 10000, phoneNumber)

        expect(sentPhoneNumber).toEqual(phoneNumber)
      })

      it('will return success when the phone number is updated', async () => {
        const result = await hmppsAgencyRegisterApiService.updateCourtPhoneNumber({}, 'SHFCC', 10000, phoneNumber)

        expect(result).toEqual({ success: true })
      })
    })

    it.each([400, 404, 500])('will propagate an API error with status %s', async status => {
      fakeHmppsAgencyRegisterApi.put('/courts/id/SHFCC/phone-number/10000').reply(status, { status })

      await expect(
        hmppsAgencyRegisterApiService.updateCourtPhoneNumber({}, 'SHFCC', 10000, phoneNumber),
      ).rejects.toMatchObject({
        status,
      })
    })
  })

  describe('updateCourtEmailAddress', () => {
    const emailAddress: UpdateEmailAddress = { address: 'sheffield.court.updated@example.com' }
    const updatedEmailAddress: AgencyEmailAddress = { id: 10000, address: 'sheffield.court.updated@example.com' }
    let sentEmailAddress: UpdateEmailAddress

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .put('/courts/id/SHFCC/email-address/10000', body => {
            sentEmailAddress = body
            return true
          })
          .reply(200, updatedEmailAddress)
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.updateCourtEmailAddress({ username: 'tommy' }, 'SHFCC', 10000, emailAddress)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send the email address in the request body', async () => {
        await hmppsAgencyRegisterApiService.updateCourtEmailAddress({}, 'SHFCC', 10000, emailAddress)

        expect(sentEmailAddress).toEqual(emailAddress)
      })

      it('will return success when the email address is updated', async () => {
        const result = await hmppsAgencyRegisterApiService.updateCourtEmailAddress({}, 'SHFCC', 10000, emailAddress)

        expect(result).toEqual({ success: true })
      })
    })

    it('will throw error when the court is not found', async () => {
      fakeHmppsAgencyRegisterApi.put('/courts/id/UNKNOWN/email-address/10000').reply(404, {
        status: 404,
        developerMessage: 'Court UNKNOWN not found',
      })

      await expect(
        hmppsAgencyRegisterApiService.updateCourtEmailAddress({}, 'UNKNOWN', 10000, emailAddress),
      ).rejects.toThrow('Not Found')
    })
  })

  describe('updateCourtDetails', () => {
    const updateCourt: UpdateCourt = {
      courtName: 'Sheffield Crown Court Updated',
      description: 'Sheffield Main Crown Court Updated',
      active: true,
      cjitCode: 'C00SH00',
      accessibleAccess: 'NONE',
      areaCode: 'YH',
      regionCode: 'YH',
      geographicalAreaCode: 'YH',
      localAuthorityCode: 'YH',
      payrollRegionCode: 'YH',
      courtTypeCode: 'CC',
    }
    let sentCourt: UpdateCourt

    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    describe('on success', () => {
      beforeEach(() => {
        fakeHmppsAgencyRegisterApi
          .put('/courts/id/SHFCC', body => {
            sentCourt = body
            return true
          })
          .reply(200, courtData.court({ courtName: 'Sheffield Crown Court Updated' }))
      })

      it('username will be used by client', async () => {
        await hmppsAgencyRegisterApiService.updateCourtDetails({ username: 'tommy' }, 'SHFCC', updateCourt)

        expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      })

      it('will send all the court fields in the request body', async () => {
        await hmppsAgencyRegisterApiService.updateCourtDetails({}, 'SHFCC', updateCourt)

        expect(sentCourt).toEqual(updateCourt)
      })

      it('will return success when the court is updated', async () => {
        expect(await hmppsAgencyRegisterApiService.updateCourtDetails({}, 'SHFCC', updateCourt)).toEqual({
          success: true,
        })
      })
    })

    it('will throw error when the court is not found', async () => {
      fakeHmppsAgencyRegisterApi.put('/courts/id/UNKNOWN').reply(404, { status: 404 })

      await expect(hmppsAgencyRegisterApiService.updateCourtDetails({}, 'UNKNOWN', updateCourt)).rejects.toThrow(
        'Not Found',
      )
    })
  })

  describe.each([
    {
      method: 'updateCourtDetails',
      httpMethod: 'put' as const,
      path: '/courts/id/SHFCC',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.updateCourtDetails({}, 'SHFCC', { courtName: 'Name', active: true, courtTypeCode: 'CC' }),
    },
    {
      method: 'addCourtEmailAddress',
      httpMethod: 'post' as const,
      path: '/courts/id/SHFCC/email-address',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.addCourtEmailAddress({}, 'SHFCC', { address: 'sheffield.court@example.com' }),
    },
    {
      method: 'updateCourtEmailAddress',
      httpMethod: 'put' as const,
      path: '/courts/id/SHFCC/email-address/10000',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.updateCourtEmailAddress({}, 'SHFCC', 10000, { address: 'sheffield.court@example.com' }),
    },
    {
      method: 'addCourtPhoneNumber',
      httpMethod: 'post' as const,
      path: '/courts/id/SHFCC/phone-number',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.addCourtPhoneNumber({}, 'SHFCC', { number: '0114 555 9898' }),
    },
    {
      method: 'updateCourtPhoneNumber',
      httpMethod: 'put' as const,
      path: '/courts/id/SHFCC/phone-number/10000',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.updateCourtPhoneNumber({}, 'SHFCC', 10000, { number: '0114 555 9898' }),
    },
    {
      method: 'addCourtAddress',
      httpMethod: 'post' as const,
      path: '/courts/id/SHFCC/address',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.addCourtAddress({}, 'SHFCC', { town: 'Sheffield', postcode: 'S1 2BJ', country: 'England' }),
    },
    {
      method: 'updateCourtAddress',
      httpMethod: 'put' as const,
      path: '/courts/id/SHFCC/address/2',
      invoke: (service: HMPPSAgencyRegisterApi) =>
        service.updateCourtAddress({}, 'SHFCC', 2, {
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          country: 'England',
        }),
    },
  ])('$method API errors', ({ httpMethod, path, invoke }) => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('returns a 400 user message without requiring an error property', async () => {
      const scope = fakeHmppsAgencyRegisterApi[httpMethod](path).reply(400, {
        userMessage: 'This value already exists',
        developerMessage: 'Duplicate value',
      })

      await expect(invoke(hmppsAgencyRegisterApiService)).resolves.toEqual({
        success: false,
        userMessage: 'This value already exists',
      })
      expect(scope.isDone()).toBe(true)
    })

    it.each([
      {},
      { userMessage: null },
      { userMessage: '' },
      { userMessage: '   ' },
      { userMessage: '\t\n' },
      { userMessage: 123 },
      { userMessage: false },
      { userMessage: [] },
      { userMessage: {} },
    ])('propagates a 400 response without a usable user message: %j', async body => {
      fakeHmppsAgencyRegisterApi[httpMethod](path).reply(400, body)

      await expect(invoke(hmppsAgencyRegisterApiService)).rejects.toMatchObject({ status: 400 })
    })

    it('propagates a server error even when it contains a user message', async () => {
      fakeHmppsAgencyRegisterApi[httpMethod](path).reply(500, { userMessage: 'Service unavailable' })

      await expect(invoke(hmppsAgencyRegisterApiService)).rejects.toMatchObject({ status: 500 })
    })
  })

  describe('deleteCourtAddress', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('uses the authenticated user and deletes only the selected address', async () => {
      const scope = fakeHmppsAgencyRegisterApi.delete('/courts/id/SHFCC/address/2').reply(204)

      await hmppsAgencyRegisterApiService.deleteCourtAddress({ username: 'tommy' }, 'SHFCC', 2)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('encodes the court ID', async () => {
      const scope = fakeHmppsAgencyRegisterApi.delete('/courts/id/a%2Fb/address/2').reply(204)

      await hmppsAgencyRegisterApiService.deleteCourtAddress({}, 'a/b', 2)

      expect(scope.isDone()).toBe(true)
    })

    it.each([400, 401, 403, 404, 500])('propagates API errors: %s', async status => {
      fakeHmppsAgencyRegisterApi
        .delete('/courts/id/SHFCC/address/2')
        .times(status === 500 ? 3 : 1)
        .reply(status, { status })

      await expect(hmppsAgencyRegisterApiService.deleteCourtAddress({}, 'SHFCC', 2)).rejects.toMatchObject({
        status,
      })
    })
  })

  describe('deleteCourtPhoneNumber', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
    })

    it('will use the username to get an API token and delete the court phone number', async () => {
      const scope = fakeHmppsAgencyRegisterApi.delete('/courts/id/SHFCC/phone-number/10000').reply(204)

      await hmppsAgencyRegisterApiService.deleteCourtPhoneNumber({ username: 'tommy' }, 'SHFCC', 10000)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
      expect(scope.isDone()).toBe(true)
    })

    it('will throw an error when the court phone number is not found', async () => {
      fakeHmppsAgencyRegisterApi.delete('/courts/id/UNKNOWN/phone-number/10000').reply(404, {
        status: 404,
        developerMessage: 'Court phone number not found',
      })

      await expect(hmppsAgencyRegisterApiService.deleteCourtPhoneNumber({}, 'UNKNOWN', 10000)).rejects.toThrow(
        'Not Found',
      )
    })
  })

  describe('deleteCourtEmailAddress', () => {
    beforeEach(() => {
      hmppsAuthClient = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
      hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)
      fakeHmppsAgencyRegisterApi.delete('/courts/id/SHFCC/email-address/10000').reply(204)
    })

    it('will use the username to get an API token and delete the court email address', async () => {
      await hmppsAgencyRegisterApiService.deleteCourtEmailAddress({ username: 'tommy' }, 'SHFCC', 10000)

      expect(hmppsAuthClient.getApiClientToken).toHaveBeenCalledWith('tommy')
    })

    it('will throw an error when the court email address is not found', async () => {
      fakeHmppsAgencyRegisterApi.delete('/courts/id/UNKNOWN/email-address/10000').reply(404, {
        status: 404,
        developerMessage: 'Court email address not found',
      })

      await expect(hmppsAgencyRegisterApiService.deleteCourtEmailAddress({}, 'UNKNOWN', 10000)).rejects.toThrow(
        'Not Found',
      )
    })
  })
})

describe('Court creation API', () => {
  let auth: jest.Mocked<HmppsAuthClient>
  let service: HMPPSAgencyRegisterApi
  const court: CreateCourt = {
    courtId: 'NEWCC',
    courtName: 'New Crown Court',
    active: true,
    courtTypeCode: 'CC',
    addresses: [],
    phoneNumbers: [],
    emailAddresses: [],
  }

  beforeEach(() => {
    auth = new HmppsAuthClient({} as TokenStore) as jest.Mocked<HmppsAuthClient>
    auth.getApiClientToken.mockResolvedValue('court-creation-test-token')
    service = new HMPPSAgencyRegisterApi(auth)
  })

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  it('creates a court using the API client token and the complete creation DTO', async () => {
    const api = nock(config.apis.prisonRegister.url)
      .post('/courts', court)
      .matchHeader('authorization', 'Bearer court-creation-test-token')
      .reply(201, courtData.court({ courtId: court.courtId }))

    expect(await service.createCourt({ username: 'tom' }, court)).toEqual({ success: true })
    expect(auth.getApiClientToken).toHaveBeenCalledWith('tom')
    expect(api.isDone()).toBe(true)
  })

  it('returns actionable API validation errors for correction', async () => {
    nock(config.apis.prisonRegister.url)
      .post('/courts', court)
      .reply(400, { userMessage: 'Court NEWCC already exists' })

    expect(await service.createCourt({}, court)).toEqual({
      success: false,
      userMessage: 'Court NEWCC already exists',
    })
  })

  it.each([
    { status: 400, data: { developerMessage: 'Invalid request' } },
    { status: 400, data: { userMessage: ' ' } },
    { status: 403, data: { userMessage: 'Not authorised' } },
    { status: 500, data: { userMessage: 'Service unavailable' } },
  ])('propagates unexpected creation errors: $status $data', async ({ status, data }) => {
    nock(config.apis.prisonRegister.url).post('/courts', court).reply(status, data)

    await expect(service.createCourt({}, court)).rejects.toMatchObject({ status })
  })

  it('finds an existing court with the authenticated user context', async () => {
    const existing = courtData.court({ courtId: court.courtId })
    const api = nock(config.apis.prisonRegister.url)
      .get('/courts/id/NEWCC')
      .matchHeader('authorization', 'Bearer court-creation-test-token')
      .reply(200, existing)

    expect(await service.findCourt({ username: 'tom' }, court.courtId)).toEqual(existing)
    expect(auth.getApiClientToken).toHaveBeenCalledWith('tom')
    expect(api.isDone()).toBe(true)
  })

  it('treats only a not-found response as an available court ID', async () => {
    nock(config.apis.prisonRegister.url).get('/courts/id/NEWCC').reply(404, { userMessage: 'Not found' })

    expect(await service.findCourt({}, court.courtId)).toBeUndefined()
  })

  it.each([401, 403, 500])('propagates lookup failures rather than accepting an ID: %s', async status => {
    nock(config.apis.prisonRegister.url)
      .get('/courts/id/NEWCC')
      .times(status === 500 ? 3 : 1)
      .reply(status, {})

    await expect(service.findCourt({}, court.courtId)).rejects.toMatchObject({ status })
  })

  it('encodes the court ID when constructing the lookup URL', async () => {
    const api = nock(config.apis.prisonRegister.url).get('/courts/id/a%2Fb').reply(404, {})

    expect(await service.findCourt({}, 'a/b')).toBeUndefined()
    expect(api.isDone()).toBe(true)
  })

  it.each(['findCourt', 'createCourt'] as const)('propagates authentication failures for %s', async method => {
    const error = new Error('Authentication unavailable')
    auth.getApiClientToken.mockRejectedValue(error)

    const result = method === 'findCourt' ? service.findCourt({}, court.courtId) : service.createCourt({}, court)
    await expect(result).rejects.toBe(error)
  })
})
