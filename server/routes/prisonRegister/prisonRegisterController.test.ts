import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonRegisterController from './prisonRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'

jest.mock('../../services/PrisonRegisterService')

describe('Prison Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: PrisonRegisterController
  const req = {
    query: {},
    session: {},
    flash: jest.fn(),
  } as unknown as Request
  const res = {
    locals: {},
    render: jest.fn(),
    redirect: jest.fn(),
  } as unknown as Response

  afterEach(jest.resetAllMocks)

  describe('showAllPrisons', () => {
    beforeEach(() => {
      prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
      controller = new PrisonRegisterController(prisonRegisterService)
      prisonRegisterService.getPrisons.mockResolvedValue([
        {
          prisonId: 'ALI',
          prisonName: 'Albany (HMP)',
          active: true,
        },
      ])
    })

    it('will render all prisons page with prisons', async () => {
      await controller.showAllPrisons(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/prison-register/allPrisons',
        expect.objectContaining({
          prisons: [expect.objectContaining({ id: 'ALI' })],
        })
      )
    })
  })
})
