import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import OtherAgencyRegisterController from './otherAgencyRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockOtherAgencyData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Other Agency Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: OtherAgencyRegisterController
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
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new OtherAgencyRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllOtherAgencies', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getOtherAgencies.mockResolvedValue([data.otherAgency({ agencyId: 'SHFPECS' })])
    })

    it('will render all other agencies page with other agencies', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/other-agency-register/allOtherAgencies',
        expect.objectContaining({
          otherAgencies: [expect.objectContaining({ id: 'SHFPECS' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with type filter param', async () => {
      req.query.otherAgencyTypeCodes = ['PECS', 'AIRPORT']

      await controller.showAllOtherAgencies(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgencies).toHaveBeenCalledWith(
        {},
        { otherAgencyTypeCodes: ['PECS', 'AIRPORT'] },
      )
    })

    it('will set the list page link in the session', async () => {
      const reqWithQueryParms = {
        query: {},
        session: {},
        flash: jest.fn(),
      } as unknown as Request
      await controller.showAllOtherAgencies(reqWithQueryParms, res)
      expect(reqWithQueryParms.session.allListPageLink).toEqual('/other-agency-register')
    })
  })

  describe('viewOtherAgency', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getOtherAgency.mockResolvedValue(data.otherAgency({ agencyId: 'SHFPECS' }))
      req.query.id = 'SHFPECS'
    })

    it('will render other agency page with other agency', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewOtherAgency(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgency).toHaveBeenCalledWith({ username: 'tom' }, 'SHFPECS')
      expect(res.render).toHaveBeenCalledWith(
        'pages/other-agency-register/otherAgencyDetails',
        expect.objectContaining({
          otherAgency: expect.objectContaining({ agencyId: 'SHFPECS' }),
        }),
      )
    })

    it('it will call register service with agency Id parameter', async () => {
      await controller.viewOtherAgency(req, res)

      expect(hmppsAgencyRegisterApiService.getOtherAgency).toHaveBeenCalledWith({}, 'SHFPECS')
    })
  })
})
