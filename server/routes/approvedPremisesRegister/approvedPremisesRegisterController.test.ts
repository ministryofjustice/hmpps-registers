import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import ApprovedPremisesRegisterController from './approvedPremisesRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockApprovedPremisesData'

jest.mock('../../services/prisonRegisterService')

describe('Approved Premises Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: ApprovedPremisesRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new ApprovedPremisesRegisterController(prisonRegisterService)
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

  describe('showAllApprovedPremises', () => {
    beforeEach(() => {
      prisonRegisterService.getAllApprovedPremises.mockResolvedValue([
        data.approvedPremises({ approvedPremisesId: 'SHFAP' }),
      ])
    })

    it('will render all approved premises page with approved premises', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllApprovedPremises(req, res)

      expect(prisonRegisterService.getAllApprovedPremises).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/approved-premises-register/allApprovedPremises',
        expect.objectContaining({
          approvedPremisesList: [expect.objectContaining({ id: 'SHFAP' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllApprovedPremises(req, res)

      expect(prisonRegisterService.getAllApprovedPremises).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllApprovedPremises(req, res)

      expect(prisonRegisterService.getAllApprovedPremises).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllApprovedPremises(req, res)

      expect(prisonRegisterService.getAllApprovedPremises).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllApprovedPremises(req, res)

      expect(prisonRegisterService.getAllApprovedPremises).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllApprovedPremises(req, res)

      expect(req.session.allListPageLink).toEqual('/approved-premises-register')
    })
  })
})
