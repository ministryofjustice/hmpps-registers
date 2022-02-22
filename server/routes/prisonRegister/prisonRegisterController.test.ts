import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonRegisterController from './prisonRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockData'

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
        })
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

    it('it will call prison register service with active and textSearch filter params', async () => {
      req.query.active = 'true'
      req.query.textSearch = 'ALI'

      await controller.showAllPrisons(req, res)

      expect(prisonRegisterService.getPrisonsWithFilter).toHaveBeenCalledWith({}, { active: true, textSearch: 'ALI' })
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
