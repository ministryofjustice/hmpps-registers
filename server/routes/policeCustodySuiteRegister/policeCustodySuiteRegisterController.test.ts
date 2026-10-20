import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import PoliceCustodySuiteRegisterController from './policeCustodySuiteRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockPoliceCustodySuiteData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Police Custody Suite Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: PoliceCustodySuiteRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new PoliceCustodySuiteRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllPoliceCustodySuites', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getPoliceCustodySuites.mockResolvedValue([
        data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' }),
      ])
    })

    it('will render all police custody suites page with police custody suites', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/police-custody-suite-register/allPoliceCustodySuites',
        expect.objectContaining({
          policeCustodySuites: [expect.objectContaining({ id: 'SHFPCS' })],
        }),
      )
    })

    it('will call register service with no filter params', async () => {
      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, {})
    })

    it('will call register service with active filter param', async () => {
      req.query.active = 'false'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, { active: false })
    })

    it('will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('will ignore unsupported filter params', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllPoliceCustodySuites(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuites).toHaveBeenCalledWith({}, {})
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllPoliceCustodySuites(req, res)

      expect(req.session.allListPageLink).toEqual('/police-custody-suite-register')
    })
  })

  describe('viewPoliceCustodySuite', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getPoliceCustodySuite.mockResolvedValue(
        data.policeCustodySuite({ policeCustodySuiteId: 'SHFPCS' }),
      )
      req.query.id = 'SHFPCS'
    })

    it('will render police custody suite page with police custody suite', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewPoliceCustodySuite(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuite).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPCS')
      expect(res.render).toHaveBeenCalledWith(
        'pages/police-custody-suite-register/policeCustodySuiteDetails',
        expect.objectContaining({
          policeCustodySuite: expect.objectContaining({ policeCustodySuiteId: 'SHFPCS' }),
        }),
      )
    })

    it('will call register service with police custody suite Id parameter', async () => {
      await controller.viewPoliceCustodySuite(req, res)

      expect(hmppsAgencyRegisterApiService.getPoliceCustodySuite).toHaveBeenCalledWith({}, 'SHFPCS')
    })
  })
})
