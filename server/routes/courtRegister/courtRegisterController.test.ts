import type { Request, Response } from 'express'
import CourtRegisterService from '../../services/courtRegisterService'
import CourtRegisterController from './courtRegisterController'
import data from '../testutils/mockData'
import HmppsAuthClient from '../../data/hmppsAuthClient'

jest.mock('../../services/courtRegisterService')

describe('Court Register controller', () => {
  let courtRegisterService: jest.Mocked<CourtRegisterService>
  let controller: CourtRegisterController
  const req = ({
    query: {},
    session: {},
    flash: jest.fn(),
  } as unknown) as Request
  const res = ({
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown) as Response

  afterEach(jest.resetAllMocks)
  describe('getPageOfCourts', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getPageOfCourts.mockResolvedValue({
        content: [
          data.court({
            courtId: 'SHFCC',
            courtName: 'Sheffield Crown Court',
            courtDescription: 'Sheffield Crown Court - Yorkshire',
            type: { courtType: 'CROWN', courtName: 'Crown' },
            active: true,
          }),
        ],
        first: true,
        last: true,
        empty: false,
        totalPages: 1,
        totalElements: 1,
        number: 0,
        size: 20,
        numberOfElements: 1,
      })
      courtRegisterService.getCourtTypes.mockResolvedValue([
        { courtType: 'COU', courtName: 'County' },
        { courtType: 'CRN', courtName: 'Crown' },
      ])
    })
    it('will render all courts page with courts', async () => {
      await controller.showAllCourts(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/allCourts',
        expect.objectContaining({
          courts: [expect.objectContaining({ id: 'SHFCC' })],
        })
      )
    })
    it('will map the page number to Springs zero based pages', async () => {
      await controller.showAllCourts(req, res)
      expect(courtRegisterService.getPageOfCourts).toHaveBeenCalledWith(expect.anything(), 0, 40, expect.anything())
    })
    it('will parse an empty filter from the query parameters', async () => {
      await controller.showAllCourts(req, res)
      expect(courtRegisterService.getPageOfCourts).toHaveBeenCalledWith(expect.anything(), 0, 40, {})
    })
    it('will parse a filter from the query parameters', async () => {
      const reqWithQueryParms = ({
        query: { active: 'false', courtTypeIds: ['COU', 'CRO'], textSearch: 'some-search-text' },
        session: {},
        flash: jest.fn(),
      } as unknown) as Request
      await controller.showAllCourts(reqWithQueryParms, res)
      expect(courtRegisterService.getPageOfCourts).toHaveBeenCalledWith(expect.anything(), 0, 40, {
        active: false,
        courtTypeIds: ['COU', 'CRO'],
        textSearch: 'some-search-text',
      })
    })
    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = ({
        query: { active: 'false', courtTypeIds: ['COU', 'CRO'], page: 2 },
        session: {},
        flash: jest.fn(),
      } as unknown) as Request
      await controller.showAllCourts(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.courtListPageLink).toEqual(
        '/court-register?page=2&active=false&courtTypeIds=COU&courtTypeIds=CRO'
      )
    })
  })
  describe('viewCourt', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getCourt.mockResolvedValue(data.court({ courtId: 'SHFCC' }))
    })
    it('will request court for id', async () => {
      req.query.id = 'SHFCC'
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewCourt(req, res)

      expect(courtRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
    })
    it('will render court details page with court with a default action of NONE', async () => {
      await controller.viewCourt(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register/courtDetails', {
        courtDetails: expect.objectContaining({ id: 'SHFCC' }),
        backLink: '/court-register?page=1',
        action: 'NONE',
      })
    })
    it('will render court details page passing through the action', async () => {
      req.query.action = 'ACTIVATE'

      await controller.viewCourt(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register/courtDetails', {
        courtDetails: expect.objectContaining({ id: 'SHFCC' }),
        backLink: '/court-register?page=1',
        action: 'ACTIVATE',
      })
    })
  })
  describe('toggleCourtActive', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      req.body = {
        id: 'SHFCC',
        active: 'true',
      }
      res.locals.user = {
        username: 'tom',
      }
    })
    it('will update court by id', async () => {
      await controller.toggleCourtActive(req, res)

      expect(courtRegisterService.updateActiveMarker).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', true)
    })
    it('will redirect back to court details view with action', async () => {
      await controller.toggleCourtActive(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=ACTIVATE')
    })
    it('can deactivate court', async () => {
      req.body = {
        id: 'SHFCC',
        active: 'false',
      }

      await controller.toggleCourtActive(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/court-register/details?id=SHFCC&action=DEACTIVATE')
    })
  })
  describe('Add new court flow', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getCourtTypes.mockResolvedValue([
        {
          courtType: 'CRN',
          courtName: 'Crown Court',
        },
        {
          courtType: 'MAG',
          courtName: 'Magistrates Court',
        },
      ])
    })
    describe('addNewCourtStart', () => {
      it('will clear any existing form', async () => {
        req.session.addNewCourtForm = {
          id: 'SHFCC',
        }

        controller.addNewCourtStart(req, res)

        expect(req.session.addNewCourtForm).toEqual({})
      })
    })
    describe('addNewCourtDetails', () => {
      it('will request court types', async () => {
        res.locals.user = {
          username: 'tom',
        }
        await controller.addNewCourtDetails(req, res)

        expect(courtRegisterService.getCourtTypes).toHaveBeenCalledWith({ username: 'tom' })
      })
      it('will render court details page with court types', async () => {
        await controller.addNewCourtDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/addNewCourtDetails', {
          form: {},
          courtTypes: expect.arrayContaining([
            expect.objectContaining({ text: 'Crown Court', value: 'CRN' }),
            expect.objectContaining({ text: 'Magistrates Court', value: 'MAG' }),
            expect.objectContaining({ text: '', value: '' }),
          ]),
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        req.session.addNewCourtForm = {
          type: 'CRN',
        }
        await controller.addNewCourtDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/addNewCourtDetails', {
          form: {
            type: 'CRN',
          },
          courtTypes: expect.arrayContaining([
            expect.objectContaining({ text: 'Crown Court', value: 'CRN' }),
            expect.objectContaining({ text: 'Magistrates Court', value: 'MAG' }),
          ]),
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
    })
    describe('addNewCourtSummary', () => {
      it('will request court types', async () => {
        res.locals.user = {
          username: 'tom',
        }
        await controller.addNewCourtSummary(req, res)

        expect(courtRegisterService.getCourtTypes).toHaveBeenCalledWith({ username: 'tom' })
      })
      it('will render summary with selected court type description', async () => {
        req.session.addNewCourtForm = {
          name: 'Sheffield Crown Court',
          type: 'CRN',
        }

        await controller.addNewCourtSummary(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/addNewCourtSummary', {
          form: {
            name: 'Sheffield Crown Court',
            type: 'CRN',
            completed: true,
          },
          typeDescription: 'Crown Court',
          backLink: '/court-register?page=1',
        })
      })
    })
  })
  describe('Amend court flow', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService({} as HmppsAuthClient) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getCourt.mockResolvedValue(
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          type: {
            courtType: 'CRN',
            courtName: 'Crown Court',
          },
        })
      )
      courtRegisterService.getCourtTypes.mockResolvedValue([
        {
          courtType: 'CRN',
          courtName: 'Crown Court',
        },
        {
          courtType: 'MAG',
          courtName: 'Magistrates Court',
        },
      ])
      courtRegisterService.getCourtBuilding.mockResolvedValue(
        data.courtBuilding({
          courtId: 'SHFCC',
          id: 1,
          buildingName: 'Crown Square',
          street: '1 High Street',
          locality: 'Castle Market',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          county: 'South Yorkshire',
          country: 'England',
          subCode: 'SHFAN',
          contacts: [
            {
              courtId: 'SHFCC',
              buildingId: 1,
              id: 1,
              type: 'TEL',
              detail: '0114 555 1234',
            },
            {
              courtId: 'SHFCC',
              buildingId: 1,
              id: 2,
              type: 'FAX',
              detail: '0114 555 4321',
            },
          ],
        })
      )
      courtRegisterService.updateCourtDetails.mockResolvedValue(undefined)
      courtRegisterService.updateCourtBuilding.mockResolvedValue(undefined)
    })
    describe('amendCourtDetailsStart', () => {
      beforeEach(() => {
        req.query.courtId = 'SHFCC'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request court types', async () => {
        await controller.amendCourtDetailsStart(req, res)

        expect(courtRegisterService.getCourtTypes).toHaveBeenCalledWith({ username: 'tom' })
      })
      it('will request court details', async () => {
        await controller.amendCourtDetailsStart(req, res)

        expect(courtRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      })
      it('will render court details page with court types', async () => {
        await controller.amendCourtDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtDetails', {
          form: expect.objectContaining({}),
          courtTypes: expect.arrayContaining([
            expect.objectContaining({ text: 'Crown Court', value: 'CRN' }),
            expect.objectContaining({ text: 'Magistrates Court', value: 'MAG' }),
          ]),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendCourtDetailsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtDetails', {
          form: {
            type: 'CRN',
            name: 'Sheffield Crown Court',
            description: 'Sheffield Crown Court - Yorkshire',
            id: 'SHFCC',
          },
          courtTypes: expect.arrayContaining([expect.objectContaining({}), expect.objectContaining({})]),
          errors: [],
        })
      })
    })
    describe('amendCourtDetails', () => {
      beforeEach(() => {
        req.session.amendCourtDetailsForm = {
          name: 'Sheffield Crown Court',
          type: 'CRN',
          id: 'SHFCC',
        }
        req.body = {
          ...req.session.amendCourtDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request court types', async () => {
        await controller.amendCourtDetails(req, res)

        expect(courtRegisterService.getCourtTypes).toHaveBeenCalledWith({ username: 'tom' })
      })
      it('will not request court details', async () => {
        await controller.amendCourtDetails(req, res)

        expect(courtRegisterService.getCourt).toBeCalledTimes(0)
      })
      it('will render court details page with court types', async () => {
        await controller.amendCourtDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtDetails', {
          form: expect.objectContaining({}),
          courtTypes: expect.arrayContaining([
            expect.objectContaining({ text: 'Crown Court', value: 'CRN' }),
            expect.objectContaining({ text: 'Magistrates Court', value: 'MAG' }),
          ]),
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.amendCourtDetails(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtDetails', {
          form: {
            name: 'Sheffield Crown Court',
            type: 'CRN',
            id: 'SHFCC',
          },
          courtTypes: expect.arrayContaining([expect.objectContaining({}), expect.objectContaining({})]),
          errors: [],
        })
      })
    })
    describe('submitAmendCourtDetails', () => {
      beforeEach(() => {
        req.session.amendCourtDetailsForm = {
          name: 'Sheffield Crown Court',
          type: 'CRN',
          id: 'SHFCC',
          description: 'Sheffield Courts',
        }
        req.body = {
          ...req.session.amendCourtDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with a valid form data', async () => {
        await controller.submitAmendCourtDetails(req, res)
        expect(courtRegisterService.updateCourtDetails).toHaveBeenCalledWith(
          { username: 'tom' },
          'SHFCC',
          'Sheffield Crown Court',
          'CRN',
          'Sheffield Courts'
        )
      })
    })
    describe('amendCourtBuildingStart', () => {
      beforeEach(() => {
        req.query.courtId = 'SHFCC'
        req.query.buildingId = '1'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request court building', async () => {
        await controller.amendCourtBuildingStart(req, res)

        expect(courtRegisterService.getCourtBuilding).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', '1')
      })
      it('will render court building page', async () => {
        await controller.amendCourtBuildingStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuilding', {
          form: expect.objectContaining({}),
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendCourtBuildingStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuilding', {
          form: {
            courtId: 'SHFCC',
            id: 1,
            subCode: 'SHFAN',
            addressline1: '1 High Street',
            addressline2: 'Castle Market',
            buildingname: 'Crown Square',
            originalbuildingname: 'Crown Square',
            addresstown: 'Sheffield',
            addresspostcode: 'S1 2BJ',
            addresscounty: 'South Yorkshire',
            addresscountry: 'England',
          },
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
    })
    describe('amendCourtBuilding', () => {
      beforeEach(() => {
        req.session.amendCourtBuildingForm = {
          courtId: 'SHFCC',
          id: 1,
          subCode: 'SHFAN',
          addressline1: '1 High Street',
          addressline2: 'Castle Market',
          buildingname: 'Crown Square',
          originalbuildingname: 'Crown Square',
          addresstown: 'Sheffield',
          addresspostcode: 'S1 2BJ',
          addresscounty: 'South Yorkshire',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.amendCourtDetailsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will not request court building', async () => {
        await controller.amendCourtBuilding(req, res)

        expect(courtRegisterService.getCourtBuilding).toBeCalledTimes(0)
      })
      it('will render court building page', async () => {
        await controller.amendCourtBuilding(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuilding', {
          form: expect.objectContaining({}),
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
      it('will pass through form to page', async () => {
        await controller.amendCourtBuilding(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuilding', {
          form: {
            courtId: 'SHFCC',
            id: 1,
            subCode: 'SHFAN',
            addressline1: '1 High Street',
            addressline2: 'Castle Market',
            buildingname: 'Crown Square',
            originalbuildingname: 'Crown Square',
            addresstown: 'Sheffield',
            addresspostcode: 'S1 2BJ',
            addresscounty: 'South Yorkshire',
            addresscountry: 'England',
          },
          backLink: '/court-register?page=1',
          errors: [],
        })
      })
    })
    describe('submitAmendCourtBuilding', () => {
      beforeEach(() => {
        req.session.amendCourtBuildingForm = {
          courtId: 'SHFCC',
          id: 1,
          subCode: 'SHFAN',
          addressline1: '1 High Street',
          addressline2: 'Castle Market',
          buildingname: 'Crown Square',
          originalbuildingname: 'Crown Square',
          addresstown: 'Sheffield ',
          addresspostcode: 'S1 2BJ',
          addresscounty: 'South Yorkshire ',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.amendCourtBuildingForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with a valid form data', async () => {
        await controller.submitAmendCourtBuilding(req, res)
        expect(courtRegisterService.updateCourtBuilding).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', 1, {
          subCode: 'SHFAN',
          street: '1 High Street',
          locality: 'Castle Market',
          buildingName: 'Crown Square',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          county: 'South Yorkshire',
          country: 'England',
        })
      })
    })
    describe('addCourtBuildingStart', () => {
      beforeEach(() => {
        req.query.courtId = 'SHFCC'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will render court building page', async () => {
        await controller.addCourtBuildingStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/addCourtBuilding', {
          form: expect.objectContaining({ courtId: 'SHFCC' }),
          errors: [],
        })
      })
    })
    describe('addCourtBuilding', () => {
      beforeEach(() => {
        req.session.addCourtBuildingForm = {
          courtId: 'SHFCC',
          addresspostcode: 'S1 2BJ',
        }
        req.body = {
          ...req.session.addCourtBuildingForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will pass through form to page', async () => {
        await controller.addCourtBuilding(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/addCourtBuilding', {
          form: {
            courtId: 'SHFCC',
            addresspostcode: 'S1 2BJ',
          },
          errors: [],
        })
      })
    })
    describe('submitAddCourtBuilding', () => {
      beforeEach(() => {
        req.session.addCourtBuildingForm = {
          courtId: 'SHFCC',
          subCode: 'SHFAN',
          addressline1: '1 High Street',
          addressline2: 'Castle Market',
          buildingname: 'Crown Square',
          originalbuildingname: 'Crown Square',
          addresstown: 'Sheffield',
          addresspostcode: 'S1 2BJ',
          addresscounty: 'South Yorkshire',
          addresscountry: 'England',
        }
        req.body = {
          ...req.session.addCourtBuildingForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with a valid form data', async () => {
        await controller.submitAddCourtBuilding(req, res)
        expect(courtRegisterService.addCourtBuilding).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', {
          subCode: 'SHFAN',
          street: '1 High Street',
          locality: 'Castle Market',
          buildingName: 'Crown Square',
          town: 'Sheffield',
          postcode: 'S1 2BJ',
          county: 'South Yorkshire',
          country: 'England',
        })
      })
    })
    describe('amendCourtBuildingContactsStart', () => {
      beforeEach(() => {
        req.query.courtId = 'SHFCC'
        req.query.buildingId = '1'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request court building', async () => {
        await controller.amendCourtBuildingContactsStart(req, res)

        expect(courtRegisterService.getCourtBuilding).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC', '1')
      })
      it('will render court building contacts page', async () => {
        await controller.amendCourtBuildingContactsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuildingContacts', {
          form: expect.objectContaining({}),
          errors: [],
        })
      })
      it('will create form and pass through to page', async () => {
        await controller.amendCourtBuildingContactsStart(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuildingContacts', {
          form: {
            courtId: 'SHFCC',
            buildingId: 1,
            buildingname: 'Crown Square',
            contacts: [
              {
                id: 1,
                type: 'TEL',
                number: '0114 555 1234',
              },
              {
                id: 2,
                type: 'FAX',
                number: '0114 555 4321',
              },
            ],
          },
          errors: [],
        })
      })
    })
    describe('amendCourtBuildingContacts', () => {
      beforeEach(() => {
        res.locals.user = {
          username: 'tom',
        }
        req.session.amendCourtBuildingContactsForm = {
          courtId: 'SHFCC',
          buildingId: '1',
          buildingname: 'Crown Building',
          contacts: [
            {
              id: '1',
              type: 'TEL',
              number: '0114 555 1234',
            },
            {
              type: 'FAX',
              number: '0114 555 4321',
            },
          ],
        }
        req.body = {
          ...req.session.amendCourtBuildingContactsForm,
        }
      })
      it('will not request court building', async () => {
        await controller.amendCourtBuildingContacts(req, res)

        expect(courtRegisterService.getCourtBuilding).toBeCalledTimes(0)
      })
      it('will pass form through to page', async () => {
        await controller.amendCourtBuildingContacts(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/court-register/amendCourtBuildingContacts', {
          form: {
            courtId: 'SHFCC',
            buildingId: '1',
            buildingname: 'Crown Building',
            contacts: [
              {
                id: '1',
                type: 'TEL',
                number: '0114 555 1234',
              },
              {
                type: 'FAX',
                number: '0114 555 4321',
              },
            ],
          },
          errors: [],
        })
      })
    })
    describe('submitAmendCourtBuildingContacts', () => {
      beforeEach(() => {
        req.session.amendCourtBuildingContactsForm = {
          courtId: 'SHFCC',
          buildingId: '1',
          contacts: [
            {
              type: 'TEL',
              number: '0114 555 1234   ',
              id: '1',
            },
            {
              type: 'FAX',
              number: '0114 555 4321',
              id: '2',
            },
            {
              type: 'TEL',
              number: '0114 555 9999',
              id: '',
            },
          ],
        }
        req.body = {
          ...req.session.amendCourtBuildingContactsForm,
        }

        res.locals.user = {
          username: 'tom',
        }
      })
      it('will call service with each new and amended contact', async () => {
        await controller.submitAmendCourtBuildingContacts(req, res)
        expect(courtRegisterService.updateCourtBuildingContacts).toHaveBeenCalledWith(
          { username: 'tom' },
          'SHFCC',
          '1',
          [
            {
              type: 'TEL',
              detail: '0114 555 1234',
              id: '1',
            },
            {
              type: 'FAX',
              detail: '0114 555 4321',
              id: '2',
            },
            {
              type: 'TEL',
              detail: '0114 555 9999',
              id: undefined,
            },
          ]
        )
      })
    })
  })
  describe('parseFilter', () => {
    it('should handle missing query parameters', () => {
      const request = ({
        query: {},
      } as unknown) as Request
      controller = new CourtRegisterController(courtRegisterService)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({})
    })
    it('should handle active query parameter', () => {
      const request = ({
        query: { active: 'true' },
      } as unknown) as Request
      controller = new CourtRegisterController(courtRegisterService)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({ active: true })
    })
    it('should handle single courtTypeIds query parameter', () => {
      const request = ({
        query: { courtTypeIds: 'CRN' },
      } as unknown) as Request
      controller = new CourtRegisterController(courtRegisterService)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({ courtTypeIds: ['CRN'] })
    })
    it('should handle multiple courtTypeIds query parameter', () => {
      const request = ({
        query: { courtTypeIds: ['CRN', 'COU'] },
      } as unknown) as Request
      controller = new CourtRegisterController(courtRegisterService)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({ courtTypeIds: ['CRN', 'COU'] })
    })
    it('should handle text search query parameter', () => {
      const request = ({
        query: { textSearch: 'some-search-text' },
      } as unknown) as Request
      controller = new CourtRegisterController(null)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({ textSearch: 'some-search-text' })
    })
    it('should handle text search query parameter as empty string ', () => {
      const request = ({
        query: { textSearch: '' },
      } as unknown) as Request
      controller = new CourtRegisterController(null)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({})
    })
    it('should handle combination of query parameters', () => {
      const request = ({
        query: { textSearch: 'some-search-text', courtTypeIds: ['CRN', 'COU'], active: 'true' },
      } as unknown) as Request
      controller = new CourtRegisterController(null)

      const filter = controller.parseFilter(request)

      expect(filter).toEqual({ textSearch: 'some-search-text', courtTypeIds: ['CRN', 'COU'], active: true })
    })
  })
})
