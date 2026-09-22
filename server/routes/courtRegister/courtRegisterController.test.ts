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

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({ username: 'tom' })
      expect(res.render).toHaveBeenCalledWith(
        'pages/court-register/allCourts',
        expect.objectContaining({
          courts: [expect.objectContaining({ id: 'SHFCC' })],
        }),
      )
    })

    it('it will call court register service with no filter params', async () => {
      await controller.showAllCourts(req, res)

      expect(prisonRegisterService.getCourts).toHaveBeenCalledWith({})
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
})
