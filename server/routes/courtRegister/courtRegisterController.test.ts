import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import CourtRegisterController from './courtRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockCourtData'

jest.mock('../../services/prisonRegisterService')

describe('Court Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: CourtRegisterController
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
    controller = new CourtRegisterController(prisonRegisterService)
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

  describe('showAllCourts', () => {
    beforeEach(() => {
      prisonRegisterService.getCourts.mockResolvedValue([data.court({ courtId: 'SHFCC' })])
    })

    it('will render all courts page with courts', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/allCourts',
        expect.objectContaining({
          courts: [expect.objectContaining({ id: 'SHFCC' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with type filter param', async () => {
      req.query.courtTypeCodes = ['CC', 'MC']

      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({}, { courtTypeCodes: ['CC', 'MC'] })
    })

    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = {
        query: {},
        session: {},
        flash: jest.fn(),
      } as unknown as Request
      await controller.showAllCourts(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.allListPageLink).toEqual('/court-register')
    })
  })

  describe('viewCourt', () => {
    beforeEach(() => {
      prisonRegisterService.getCourt.mockResolvedValue(data.court({ courtId: 'SHFCC' }))
      req.query.id = 'SHFCC'
    })

    it('will render court page with court', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewCourt(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({ username: 'tom' }, 'SHFCC')
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/courtDetails',
        expect.objectContaining({
          court: expect.objectContaining({ courtId: 'SHFCC' }),
        }),
      )
    })

    it('it will call register service with court Id parameter', async () => {
      await controller.viewCourt(req, res)

      expect(prisonRegisterService.getCourt).toHaveBeenCalledWith({}, 'SHFCC')
    })
  })
})
