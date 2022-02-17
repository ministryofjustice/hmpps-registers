import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonRegisterController from './prisonRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockData'

jest.mock('../../services/prisonRegisterService')

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

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new PrisonRegisterController(prisonRegisterService)
  })

  afterEach(jest.resetAllMocks)

  describe('showAllPrisons', () => {
    beforeEach(() => {
      prisonRegisterService.getAllPrisons.mockResolvedValue([data.prison({})])
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

  describe('viewPrison', () => {
    beforeEach(() => {
      prisonRegisterService.getPrison.mockResolvedValue(data.prison({}))
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
      })
    })
  })
})
