import type { Request, Response } from 'express'
import CourtRegisterService from '../../services/courtRegisterService'
import CourtRegisterController from './courtRegisterController'
import data from '../testutils/mockData'

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
  describe('getAllCourts', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getAllCourts.mockResolvedValue({
        courts: [data.court({ courtId: 'SHFCC' })],
      })
    })
    it('will render all courts page with courts', async () => {
      await controller.showAllCourts(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register/allCourts', {
        courts: [expect.objectContaining({ id: 'SHFCC' })],
      })
    })
  })
  describe('getPageOfCourts', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
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
    })
    it('will render all courts page with courts', async () => {
      await controller.showAllCourtsPaged(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/allCourtsPaged',
        expect.objectContaining({
          courts: [expect.objectContaining({ id: 'SHFCC' })],
        })
      )
    })
    it('will map the page number to Springs zero based pages', async () => {
      await controller.showAllCourtsPaged(req, res)
      expect(courtRegisterService.getPageOfCourts).toHaveBeenCalledWith(expect.anything(), 0, 40)
    })
  })
  describe('viewCourt', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
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
        action: 'NONE',
      })
    })
    it('will render court details page passing through the action', async () => {
      req.query.action = 'ACTIVATE'

      await controller.viewCourt(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register/courtDetails', {
        courtDetails: expect.objectContaining({ id: 'SHFCC' }),
        action: 'ACTIVATE',
      })
    })
  })
  describe('toggleCourtActive', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
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
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
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
        })
      })
    })
  })
  describe('Amend court flow', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
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
    })
    describe('amendCourtDetails', () => {
      beforeEach(() => {
        req.query.courtId = 'SHFCC'
        res.locals.user = {
          username: 'tom',
        }
      })
      it('will request court types', async () => {
        await controller.amendCourtDetails(req, res)

        expect(courtRegisterService.getCourtTypes).toHaveBeenCalledWith({ username: 'tom' })
      })
      it('will request court details', async () => {
        await controller.amendCourtDetails(req, res)

        expect(courtRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
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
      it('will create form and pass through to page', async () => {
        await controller.amendCourtDetails(req, res)

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
  })
})
