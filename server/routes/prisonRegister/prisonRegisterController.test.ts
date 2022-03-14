import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonRegisterController from './prisonRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockPrisonData'

jest.mock('../../services/prisonRegisterService')

describe('Prison Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: PrisonRegisterController
  let req = {
    query: {},
    session: {},
    flash: jest.fn(),
  } as unknown as Request
  let res = {
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new PrisonRegisterController(prisonRegisterService)
    req = {
      query: {},
      session: {},
      flash: jest.fn(),
    } as unknown as Request
    res = {
      locals: {},
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  afterEach(jest.resetAllMocks)

  describe('showAllPrisons', () => {
    beforeEach(() => {
      prisonRegisterService.getPrisonsWithFilter.mockResolvedValue([data.prison({})])
    })

    it('will render all prisons page with prisons', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/prison-register/allPrisons',
        expect.objectContaining({
          prisons: [expect.objectContaining({ id: 'ALI' })],
        })
      )
    })

    it('it will call prison register service with no filter params', async () => {
      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, {})
    })

    it('it will call prison register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call prison register service with textSearch filter param', async () => {
      req.query.textSearch = 'ALI'

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { textSearch: 'ALI' })
    })

    it('it will call prison register service with female filter param', async () => {
      req.query.genders = ['FEMALE']

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { genders: ['FEMALE'] })
    })

    it('it will not populate gender filter if both are provided', async () => {
      req.query.genders = ['MALE', 'FEMALE']

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, {})
    })

    it('it will call prison register service with type filter param', async () => {
      req.query.prisonTypeCodes = ['HMP']

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { prisonTypeCodes: ['HMP'] })
    })

    it('it will call prison register service with all filter params', async () => {
      req.query.active = 'true'
      req.query.textSearch = 'ALI'
      req.query.genders = ['MALE']
      req.query.prisonTypeCodes = ['HMP']

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith(
        {},
        { active: true, textSearch: 'ALI', genders: ['MALE'], prisonTypeCodes: ['HMP'] }
      )
    })
  })

  describe('viewPrison', () => {
    beforeEach(() => {
      prisonRegisterService.getPrison.mockResolvedValue(data.prison({ addresses: [data.prisonAddress({})] }))
    })

    it('will request prison for id', async () => {
      req.query.id = 'ALI'
      res.locals.user = {
        username: 'tom',
      }

      await controller.viewPrison(req, res)

      expect(prisonRegisterService.getPrison).toHaveBeenCalledWith({ username: 'tom' }, 'ALI')
    })

    it('will render prison details page', async () => {
      await controller.viewPrison(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/prison-register/prisonDetails', {
        prisonDetails: expect.objectContaining({ id: 'ALI' }),
        action: 'NONE',
      })
    })

    it('will render prison details page with address', async () => {
      await controller.viewPrison(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/prison-register/prisonDetails', {
        prisonDetails: expect.objectContaining({
          id: 'ALI',
          name: 'Albany (HMP)',
          active: true,
          female: true,
          male: true,
          addresses: [
            {
              id: 21,
              line1: 'Bawtry Road',
              line2: 'Hatfield Woodhouse',
              town: 'Doncaster',
              country: 'England',
              county: 'South Yorkshire',
              postcode: 'DN7 6BW',
            },
          ],
        }),
        action: 'NONE',
      })
    })
  })

  describe('Amend prison flow', () => {
    beforeEach(() => {
      prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
      controller = new PrisonRegisterController(prisonRegisterService)
      prisonRegisterService.getPrison.mockResolvedValue(
        data.prison({
          prisonId: 'MDI',
          prisonName: 'HMP Moorland',
          active: true,
        })
      )
      prisonRegisterService.getPrisonAddress.mockResolvedValue(data.prisonAddress({}))

      prisonRegisterService.updatePrisonDetails.mockResolvedValue(undefined)
      prisonRegisterService.updatePrisonAddress.mockResolvedValue(undefined)
    })

    describe('amendPrisonDetailsStart', () => {
      beforeEach(() => {
        req.query.prisonId = 'MDI'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request prison details', async () => {
        await controller.amendPrisonDetailsStart(req, res)

        expect(prisonRegisterService.getPrison).toHaveBeenCalledWith({ username: 'tom' }, 'MDI')
      })
      it('will render prison details page', async () => {
        await controller.amendPrisonDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendPrisonDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: {
            id: 'MDI',
            name: 'HMP Moorland',
          },
          errors: [],
        })
      })
    })

    describe('amendPrisonDetails', () => {
      beforeEach(() => {
        req.session.amendPrisonDetailsForm = {
          id: 'MDI',
          name: 'HMP Moorland',
        }
        req.body = {
          ...req.session.amendPrisonDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will not request prison details', async () => {
        await controller.amendPrisonDetails(req, res)

        expect(prisonRegisterService.getPrison).toBeCalledTimes(0)
      })
      it('will render prison details page', async () => {
        await controller.amendPrisonDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.amendPrisonDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: {
            id: 'MDI',
            name: 'HMP Moorland',
          },
          errors: [],
        })
      })
    })
    describe('submitAmendPrisonDetails', () => {
      beforeEach(() => {
        req.session.amendPrisonDetailsForm = {
          name: 'HMP Moorland',
          id: 'MDI',
        }
        req.body = {
          ...req.session.amendPrisonDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with a valid form data', async () => {
        await controller.submitAmendPrisonDetails(req, res)
        expect(prisonRegisterService.updatePrisonDetails).toHaveBeenCalledWith(
          { username: 'tom' },
          'MDI',
          'HMP Moorland'
        )
      })
    })

    describe('amendPrisonAddressStart', () => {
      beforeEach(() => {
        req.query.prisonId = 'MDI'
        req.query.addressId = '21'
        res.locals.user = {
          username: 'tom',
        }
      })

      it('will request prison address', async () => {
        await controller.amendPrisonAddressStart(req, res)

        expect(prisonRegisterService.getPrisonAddress).toHaveBeenCalledWith({ username: 'tom' }, 'MDI', '21')
      })
      it('will render prison address page', async () => {
        await controller.amendPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonAddress', {
          form: {
            prisonId: 'MDI',
            id: '21',
            addressline1: 'Bawtry Road',
            addressline2: 'Hatfield Woodhouse',
            addresstown: 'Doncaster',
            addresscounty: 'South Yorkshire',
            addresspostcode: 'DN7 6BW',
            addresscountry: 'England',
          },
          errors: [],
        })
      })
    })
    describe('amendPrisonAddress', () => {
      beforeEach(() => {
        req.session.amendPrisonAddressForm = {
          prisonId: 'MDI',
          id: 21,
          addressline1: 'Bawtry Road',
          addressline2: 'Hatfield Woodhouse',
          addresstown: 'Doncaster',
          addresscounty: 'South Yorkshire',
          addresspostcode: 'DN7 6BW',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.amendPrisonDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will not request prison address', async () => {
        await controller.amendPrisonAddress(req, res)

        expect(prisonRegisterService.getPrisonAddress).toBeCalledTimes(0)
      })
      it('will render prison address page', async () => {
        await controller.amendPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.amendPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonAddress', {
          form: {
            prisonId: 'MDI',
            id: 21,
            addressline1: 'Bawtry Road',
            addressline2: 'Hatfield Woodhouse',
            addresstown: 'Doncaster',
            addresscounty: 'South Yorkshire',
            addresspostcode: 'DN7 6BW',
            addresscountry: 'England',
          },
          errors: [],
        })
      })
    })

    describe('submitAmendPrisonAddress', () => {
      beforeEach(() => {
        req.session.amendPrisonAddressForm = {
          prisonId: 'MDI',
          id: 21,
          addressline1: 'Bawtry Road',
          addressline2: 'Hatfield Woodhouse',
          addresstown: 'Doncaster',
          addresscounty: 'South Yorkshire',
          addresspostcode: 'DN7 6BW',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.amendPrisonAddressForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with valid form data', async () => {
        await controller.submitAmendPrisonAddress(req, res)
        expect(prisonRegisterService.updatePrisonAddress).toHaveBeenCalledWith({ username: 'tom' }, 'MDI', 21, {
          addressLine1: 'Bawtry Road',
          addressLine2: 'Hatfield Woodhouse',
          town: 'Doncaster',
          county: 'South Yorkshire',
          postcode: 'DN7 6BW',
          country: 'England',
        })
      })
    })
  })
})
