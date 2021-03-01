import type { Request } from 'express'
import CourtRegisterService from '../../services/courtRegisterService'
import CourtRegisterController from './courtRegisterController'

jest.mock('../../services/courtRegisterService')

describe('Court Register controller', () => {
  let courtRegisterService: jest.Mocked<CourtRegisterService>
  let controller: CourtRegisterController
  const request = {} as Request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockResponse: any = {
    render: jest.fn(),
  }

  describe('getAllCourts', () => {
    beforeEach(() => {
      courtRegisterService = new CourtRegisterService(null) as jest.Mocked<CourtRegisterService>
      controller = new CourtRegisterController(courtRegisterService)
      courtRegisterService.getAllCourts.mockResolvedValue({
        courts: [
          {
            courtId: 'SHFCC',
            courtName: 'court',
            courtType: 'MAGISTRATES',
            courtDescription: 'court description',
            active: true,
          },
        ],
      })
    })
    it('will render court-register page with courts', async () => {
      await controller.showAllCourts(request, mockResponse)

      expect(mockResponse.render).toHaveBeenCalledWith('pages/court-register', {
        courts: [{ active: true, id: 'SHFCC', name: 'court', type: 'Magistrates' }],
      })
    })
  })
})
