import type { Request, Response } from 'express'
import CourtRegisterService from '../../services/courtRegisterService'
import CourtRegisterController from './courtRegisterController'
import data from '../testutils/mockData'

jest.mock('../../services/courtRegisterService')

describe('Court Register controller', () => {
  let courtRegisterService: jest.Mocked<CourtRegisterService>
  let controller: CourtRegisterController
  const req = {
    query: {},
  } as Request
  const res = ({
    locals: {},
    render: jest.fn(),
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
    it('will render court details page with court', async () => {
      await controller.viewCourt(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register/courtDetails', {
        courtDetails: expect.objectContaining({ id: 'SHFCC' }),
      })
    })
  })
})
