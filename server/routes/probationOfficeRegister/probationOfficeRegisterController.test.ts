import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import ProbationOfficeRegisterController from './probationOfficeRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockProbationOfficeData'

jest.mock('../../services/prisonRegisterService')

describe('Probation Office Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: ProbationOfficeRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new ProbationOfficeRegisterController(prisonRegisterService)
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

  describe('showAllProbationOffices', () => {
    beforeEach(() => {
      prisonRegisterService.getProbationOffices.mockResolvedValue([
        data.probationOffice({ probationOfficeId: 'SHFPO' }),
      ])
    })

    it('will render all probation offices page with probation offices', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllProbationOffices(req, res)

      expect(prisonRegisterService.getProbationOffices).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/probation-office-register/allProbationOffices',
        expect.objectContaining({
          probationOffices: [expect.objectContaining({ id: 'SHFPO' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllProbationOffices(req, res)

      expect(prisonRegisterService.getProbationOffices).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllProbationOffices(req, res)

      expect(prisonRegisterService.getProbationOffices).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllProbationOffices(req, res)

      expect(prisonRegisterService.getProbationOffices).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllProbationOffices(req, res)

      expect(prisonRegisterService.getProbationOffices).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllProbationOffices(req, res)

      expect(req.session.allListPageLink).toEqual('/probation-office-register')
    })
  })

  describe('viewProbationOffice', () => {
    beforeEach(() => {
      prisonRegisterService.getProbationOffice.mockResolvedValue(data.probationOffice({ probationOfficeId: 'SHFPO' }))
      req.query.id = 'SHFPO'
    })

    it('will render probation office page with probation office', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewProbationOffice(req, res)

      expect(prisonRegisterService.getProbationOffice).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPO')
      expect(res.render).toHaveBeenCalledWith(
        'pages/probation-office-register/probationOfficeDetails',
        expect.objectContaining({
          probationOffice: expect.objectContaining({ probationOfficeId: 'SHFPO' }),
        }),
      )
    })

    it('will call register service with probation office Id parameter', async () => {
      await controller.viewProbationOffice(req, res)

      expect(prisonRegisterService.getProbationOffice).toHaveBeenCalledWith({}, 'SHFPO')
    })
  })
})
