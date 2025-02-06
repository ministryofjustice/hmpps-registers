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
        }),
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

    it('it will call prison register service with lthse filter param', async () => {
      req.query.lthse = 'true'

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { lthse: true })
    })

    it('it will call prison register service with all filter params', async () => {
      req.query.active = 'true'
      req.query.textSearch = 'ALI'
      req.query.genders = ['MALE']
      req.query.prisonTypeCodes = ['HMP']
      req.query.lthse = 'true'

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith(
        {},
        { active: true, textSearch: 'ALI', genders: ['MALE'], prisonTypeCodes: ['HMP'], lthse: true },
      )
    })
    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = {
        query: { active: 'true', textSearch: 'ALI', genders: ['MALE'], prisonTypeCodes: ['HMP'], lthse: 'true' },
        session: {},
        flash: jest.fn(),
      } as unknown as Request
      await controller.showAllPrisons(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.prisonListPageLink).toEqual('/prison-register')
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
        action: 'NONE',
        prisonDetails: expect.objectContaining({ id: 'ALI' }),
        isWelshPrison: false,
      })
    })

    it('will render prison details page with English address only', async () => {
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
              countryinwelsh: undefined,
              hasWelshAddress: false,
              line1inwelsh: undefined,
              line2inwelsh: undefined,
              towninwelsh: undefined,
            },
          ],
        }),
        isWelshPrison: false,
        action: 'NONE',
      })
    })

    it('will render prison details page with both English and Welsh address', async () => {
      prisonRegisterService.getPrison.mockResolvedValue(
        data.prison({ addresses: [data.combinedEnglishAddWelshAddress({})] }),
      )

      await controller.viewPrison(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/prison-register/prisonDetails', {
        prisonDetails: expect.objectContaining({
          active: true,
          addresses: [
            {
              country: 'Wales',
              countryinwelsh: undefined,
              county: 'Glamorgan',
              hasWelshAddress: true,
              id: 21,
              line1: '2 Knox Road',
              line1inwelsh: 'Heol Knox',
              line2: null,
              line2inwelsh: 'Hollybush',
              postcode: 'CC24 0UG',
              town: 'Cardiff',
              towninwelsh: 'Caerdydd',
            },
          ],
        }),
        isWelshPrison: true,
        action: 'NONE',
      })
    })
  })

  describe('togglePrisonActive', () => {
    beforeEach(() => {
      prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
      controller = new PrisonRegisterController(prisonRegisterService)
      req.body = {
        id: 'MDI',
        active: 'true',
      }
      res.locals.user = {
        username: 'tom',
      }
    })
    it('will update prison by id', async () => {
      await controller.togglePrisonActive(req, res)

      expect(prisonRegisterService.updateActivePrisonMarker).toHaveBeenCalledWith({ username: 'tom' }, 'MDI', true)
    })
    it('will redirect back to prison details view with action', async () => {
      await controller.togglePrisonActive(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prison-register/details?id=MDI&action=ACTIVATE-PRISON')
    })
    it('can deactivate prison', async () => {
      req.body = {
        id: 'MDI',
        active: 'false',
      }

      await controller.togglePrisonActive(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prison-register/details?id=MDI&action=DEACTIVATE-PRISON')
    })
  })

  describe('Add new prison flow', () => {
    beforeEach(() => {
      prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
      controller = new PrisonRegisterController(prisonRegisterService)
    })
    describe('addNewPrisonStart', () => {
      it('will clear any existing form', async () => {
        req.session.addNewPrisonForm = {
          id: 'MDI',
        }

        controller.addNewPrisonStart(req, res)

        expect(req.session.addNewPrisonForm).toEqual({})
      })
    })
    describe('addNewPrisonDetails', () => {
      it('will render prison details page with prison types', async () => {
        req.session.prisonListPageLink = '/prison-register'
        controller.addNewPrisonStart(req, res)
        await controller.addNewPrisonDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addNewPrisonDetails', {
          form: {},
          genderValues: [
            { text: 'Male', value: 'male' },
            { text: 'Female', value: 'female' },
          ],
          prisonTypesValues: [
            { text: "His Majesty's Prison (HMP)", value: 'HMP' },
            { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
            { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
            { text: 'Secure Training Centre (STC)', value: 'STC' },
            { text: 'Youth Custody Service (YCS)', value: 'YCS' },
          ],
          backLink: '/prison-register',
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        req.session.addNewPrisonForm = {
          id: 'MDI',
          type: 'HMP',
        }
        req.session.prisonListPageLink = '/prison-register'
        await controller.addNewPrisonDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addNewPrisonDetails', {
          form: {
            id: 'MDI',
            type: 'HMP',
          },
          genderValues: [
            { text: 'Male', value: 'male' },
            { text: 'Female', value: 'female' },
          ],
          prisonTypesValues: [
            { text: "His Majesty's Prison (HMP)", value: 'HMP' },
            { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
            { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
            { text: 'Secure Training Centre (STC)', value: 'STC' },
            { text: 'Youth Custody Service (YCS)', value: 'YCS' },
          ],
          backLink: '/prison-register',
          errors: [],
        })
      })
    })
    describe('addNewPrisonSummary', () => {
      it('will render summary with selected prison type description', async () => {
        req.session.addNewPrisonForm = {
          name: 'Moorland Prison',
          prisonNameInWelsh: undefined,
          prisonTypes: ['HMP'],
          gender: ['male', 'female'],
        }
        req.session.prisonListPageLink = '/prison-register'

        await controller.addNewPrisonSummary(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addNewPrisonSummary', {
          form: {
            name: 'Moorland Prison',
            prisonTypes: ['HMP'],
            gender: ['male', 'female'],
            completed: true,
          },
          gender: ['male', 'female'],
          typeDescription: "His Majesty's Prison (HMP)",
          backLink: '/prison-register',
        })
      })

      it('will render summary will include Welsh prison name if provided', async () => {
        req.session.addNewPrisonForm = {
          name: 'HMP Cadiff',
          prisonNameInWelsh: 'Carchar Caerdydd',
          prisonTypes: ['HMP'],
          gender: ['male', 'female'],
        }
        req.session.prisonListPageLink = '/prison-register'

        await controller.addNewPrisonSummary(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addNewPrisonSummary', {
          form: {
            name: 'HMP Cadiff',
            prisonNameInWelsh: 'Carchar Caerdydd',
            prisonTypes: ['HMP'],
            gender: ['male', 'female'],
            completed: true,
          },
          gender: ['male', 'female'],
          typeDescription: "His Majesty's Prison (HMP)",
          backLink: '/prison-register',
        })
      })

      it('will render summary with selected prison type description and welsh prison name', async () => {
        req.session.addNewPrisonForm = {
          name: 'Cardif',
          prisonNameInWelsh: 'Carchar Caerdydd',
          prisonTypes: ['HMP'],
          gender: ['male', 'female'],
        }
        req.session.prisonListPageLink = '/prison-register'

        await controller.addNewPrisonSummary(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addNewPrisonSummary', {
          form: {
            name: 'Cardif',
            prisonNameInWelsh: 'Carchar Caerdydd',
            prisonTypes: ['HMP'],
            gender: ['male', 'female'],
            completed: true,
          },
          gender: ['male', 'female'],
          typeDescription: "His Majesty's Prison (HMP)",
          backLink: '/prison-register',
        })
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
          prisonNameInWelsh: '',
          active: true,
          male: true,
          female: false,
        }),
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
          genderValues: expect.objectContaining({}),
          prisonTypesValues: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendPrisonDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: {
            id: 'MDI',
            name: 'HMP Moorland',
            prisonNameInWelsh: '',
            contracted: 'no',
            lthse: 'no',
            gender: ['male'],
            prisonType: ['HMP'],
          },
          genderValues: [
            { text: 'Male', value: 'male' },
            {
              text: 'Female',
              value: 'female',
            },
          ],
          prisonTypesValues: [
            { text: "His Majesty's Prison (HMP)", value: 'HMP' },
            { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
            { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
            { text: 'Secure Training Centre (STC)', value: 'STC' },
            { text: 'Youth Custody Service (YCS)', value: 'YCS' },
          ],
          errors: [],
        })
      })

      it('will create form for Welsh prison and pass through to page', async () => {
        prisonRegisterService.getPrison.mockResolvedValue(
          data.prison({
            prisonId: 'CFI',
            prisonName: 'HMP Cardiff',
            prisonNameInWelsh: 'Carchar Caerdydd',
            active: true,
            male: true,
            female: false,
          }),
        )

        await controller.amendPrisonDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: {
            id: 'CFI',
            name: 'HMP Cardiff',
            prisonNameInWelsh: 'Carchar Caerdydd',
            contracted: 'no',
            lthse: 'no',
            gender: ['male'],
            prisonType: ['HMP'],
          },
          genderValues: [
            { text: 'Male', value: 'male' },
            {
              text: 'Female',
              value: 'female',
            },
          ],
          prisonTypesValues: [
            { text: "His Majesty's Prison (HMP)", value: 'HMP' },
            { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
            { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
            { text: 'Secure Training Centre (STC)', value: 'STC' },
            { text: 'Youth Custody Service (YCS)', value: 'YCS' },
          ],
          errors: [],
        })
      })
    })

    describe('amendPrisonDetails', () => {
      beforeEach(() => {
        req.session.amendPrisonDetailsForm = {
          id: 'MDI',
          name: 'HMP Moorland',
          gender: ['male'],
          prisonTypes: ['HMP'],
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
          genderValues: expect.objectContaining({}),
          prisonTypesValues: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.amendPrisonDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/amendPrisonDetails', {
          form: {
            id: 'MDI',
            name: 'HMP Moorland',
            gender: ['male'],
            prisonTypes: ['HMP'],
          },
          genderValues: [
            { text: 'Male', value: 'male' },
            {
              text: 'Female',
              value: 'female',
            },
          ],
          prisonTypesValues: [
            { text: "His Majesty's Prison (HMP)", value: 'HMP' },
            { text: "His Majesty's Youth Offender Institution (YOI)", value: 'YOI' },
            { text: 'Immigration Removal Centre (IRC)', value: 'IRC' },
            { text: 'Secure Training Centre (STC)', value: 'STC' },
            { text: 'Youth Custody Service (YCS)', value: 'YCS' },
          ],
          errors: [],
        })
      })
    })
    describe('submitAmendPrisonDetails', () => {
      beforeEach(() => {
        req.session.amendPrisonDetailsForm = {
          name: 'HMP Moorland',
          id: 'MDI',
          prisonNameInWelsh: '',
          contracted: 'yes',
          lthse: 'no',
          gender: ['male'],
          prisonTypes: ['HMP'],
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
          'HMP Moorland',
          null,
          'yes',
          'no',
          true,
          false,
          ['HMP'],
        )
      })

      it('will call service with a valid form data including welsh prison name', async () => {
        req.body = {
          ...req.body,
          name: 'HMP Cardiff',
          id: 'CFI',
          prisonNameInWelsh: 'Carchar Caerdydd',
        }
        await controller.submitAmendPrisonDetails(req, res)
        expect(prisonRegisterService.updatePrisonDetails).toHaveBeenCalledWith(
          { username: 'tom' },
          'CFI',
          'HMP Cardiff',
          'Carchar Caerdydd',
          'yes',
          'no',
          true,
          false,
          ['HMP'],
        )
      })
    })

    describe('addPrisonAddressStart', () => {
      beforeEach(() => {
        req.query.prisonId = 'MDI'
        res.locals.user = {
          username: 'tom',
        }
      })

      it('will render add prison address page', async () => {
        await controller.addPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.addPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addPrisonAddress', {
          form: {
            prisonId: 'MDI',
          },
          errors: [],
        })
      })
    })

    describe('addWelshPrisonAddressStart', () => {
      beforeEach(() => {
        req.query = { prisonId: 'CFI', addressId: '123' }
        res.locals.user = {
          username: 'tom',
        }
      })

      it("will render 'Add Welsh prison address' page", async () => {
        await controller.addWelshPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addWelshPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.addWelshPrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addWelshPrisonAddress', {
          form: {
            prisonId: 'CFI',
            addressId: '123',
          },
          errors: [],
        })
      })
    })

    describe('deletePrisonAddressStart', () => {
      beforeEach(() => {
        req.query.prisonId = 'MDI'
        req.query.addressId = '21'
        res.locals.user = {
          username: 'tom',
        }
        prisonRegisterService.getPrisonAddress.mockResolvedValue(data.prisonAddress({}))
      })

      it('will render delete prison address page', async () => {
        await controller.deletePrisonAddressStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/deletePrisonAddress', {
          form: expect.objectContaining({
            addresscountry: 'England',
            addresscounty: 'South Yorkshire',
            addressline1: 'Bawtry Road',
            addressline2: 'Hatfield Woodhouse',
            addresspostcode: 'DN7 6BW',
            addresstown: 'Doncaster',
            id: '21',
            prisonId: 'MDI',
          }),
          errors: [],
        })
      })
    })

    describe('submitDeletePrisonAddress', () => {
      beforeEach(() => {
        req.body = {
          id: '21',
          prisonId: 'MDI',
        }

        res.locals.user = {
          username: 'tom',
        }
      })

      it('will delete prison address', async () => {
        await controller.submitDeletePrisonAddress(req, res)

        expect(prisonRegisterService.deletePrisonAddress).toHaveBeenCalledWith({ username: 'tom' }, 'MDI', '21')
      })

      it('will redirect to prison register details', async () => {
        await controller.submitDeletePrisonAddress(req, res)

        expect(res.redirect).toHaveBeenCalledWith(`/prison-register/details?id=${req.body.prisonId}&action=UPDATED`)
      })
    })

    describe('addPrisonAddress', () => {
      beforeEach(() => {
        req.session.addPrisonAddressForm = {
          prisonId: 'MDI',
          addressline1: 'Bawtry Road',
          addressline2: 'Hatfield Woodhouse',
          addresstown: 'Doncaster',
          addresscounty: 'South Yorkshire',
          addresspostcode: 'DN7 6BW',
          addresscountry: 'England',
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will render add prison address page', async () => {
        await controller.addPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.addPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addPrisonAddress', {
          form: {
            prisonId: 'MDI',
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

    describe('addWelshPrisonAddress', () => {
      beforeEach(() => {
        req.session.addWelshPrisonAddressForm = {
          addressline1inwelsh: 'line 1',
          addressline2inwelsh: 'line 2',
          towninwelsh: 'Carchar Caerdydd',
          countyinwelsh: 'Galmorgan',
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will render add prison address page', async () => {
        await controller.addWelshPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addWelshPrisonAddress', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.addWelshPrisonAddress(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/prison-register/addWelshPrisonAddress', {
          form: {
            addressline1inwelsh: 'line 1',
            addressline2inwelsh: 'line 2',
            countyinwelsh: 'Galmorgan',
            towninwelsh: 'Carchar Caerdydd',
          },
          errors: [],
        })
      })
    })

    describe('submitAddPrisonAddress', () => {
      beforeEach(() => {
        req.session.addPrisonAddressForm = {
          prisonId: 'MDI',
          addressline1: 'Bawtry Road',
          addressline2: 'Hatfield Woodhouse',
          addresstown: 'Doncaster',
          addresscounty: 'South Yorkshire',
          addresspostcode: 'DN7 6BW',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.addPrisonAddressForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will add prison address', async () => {
        await controller.submitAddPrisonAddress(req, res)

        expect(prisonRegisterService.addPrisonAddress).toHaveBeenCalledWith({ username: 'tom' }, 'MDI', {
          addressLine1: 'Bawtry Road',
          addressLine2: 'Hatfield Woodhouse',
          town: 'Doncaster',
          county: 'South Yorkshire',
          postcode: 'DN7 6BW',
          country: 'England',
        })
      })
      it('will render prison details page', async () => {
        await controller.submitAddPrisonAddress(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/prison-register/details?id=MDI&action=UPDATED')
      })
    })

    describe('submitAddWelshPrisonAddress', () => {
      beforeEach(() => {
        req.session.addWelshPrisonAddressForm = {
          addressline1inwelsh: 'line 1',
          addressline2inwelsh: 'line 2',
          countyinwelsh: 'Galmorgan',
          towninwelsh: 'Carchar Caerdydd',
        }
        req.body = {
          prisonId: 'CFI',
          addressId: '123',
          ...req.session.addWelshPrisonAddressForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will add welsh prison address', async () => {
        await controller.submitAddWelshPrisonAddress(req, res)

        expect(prisonRegisterService.updateAddressWithWelshPrisonAddress).toHaveBeenCalledWith(
          { username: 'tom' },
          'CFI',
          '123',
          {
            addressLine1InWelsh: 'line 1',
            addressLine2InWelsh: 'line 2',
            countryInWelsh: 'Cymru',
            countyInWelsh: 'Galmorgan',
            townInWelsh: 'Carchar Caerdydd',
          },
        )
      })
      it('will render prison details page', async () => {
        await controller.submitAddWelshPrisonAddress(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/prison-register/details?id=CFI&action=UPDATED')
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
