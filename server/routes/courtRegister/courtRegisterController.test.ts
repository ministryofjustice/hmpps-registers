import type { Request, Response } from 'express'
import CourtRegisterService from '../../services/courtRegisterService'
import CourtRegisterController from './courtRegisterController'
import data from '../testutils/mockData'

jest.mock('../../services/courtRegisterService')

describe('Court Register controller', () => {
  let courtRegisterService: jest.Mocked<CourtRegisterService>
  let controller: CourtRegisterController
  const req = {} as Request
  const res = ({
    locals: {},
    render: jest.fn(),
  } as unknown) as Response

  describe('getAllCourts', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getAllCourts.mockResolvedValue({
        courts: [data.court({ courtId: 'SHFCC' })],
      })
    })
    it('will render court-register page with courts', async () => {
      await controller.showAllCourts(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/court-register', {
        courts: [expect.objectContaining({ id: 'SHFCC' })],
      })
    })
  })
})
