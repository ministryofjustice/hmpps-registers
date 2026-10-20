import type { Request, Response } from 'express'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'
import HospitalRegisterController from './hospitalRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockHospitalData'

jest.mock('../../services/hmppsAgencyRegisterApi')

describe('Hospital Register controller', () => {
  let hmppsAgencyRegisterApiService: jest.Mocked<HMPPSAgencyRegisterApi>
  let controller: HospitalRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(
      {} as HmppsAuthClient,
    ) as jest.Mocked<HMPPSAgencyRegisterApi>
    controller = new HospitalRegisterController(hmppsAgencyRegisterApiService)
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

  describe('showAllHospitals', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getHospitals.mockResolvedValue([data.hospital({ hospitalId: 'SHEFH' })])
    })

    it('will render all hospitals page with hospitals', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/hospital-register/allHospitals',
        expect.objectContaining({
          hospitals: [expect.objectContaining({ id: 'SHEFH' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with high security true filter param', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({}, { highSecurity: true })
    })

    it('it will call register service with high security false filter param', async () => {
      req.query.highSecurity = 'false'

      await controller.showAllHospitals(req, res)

      expect(hmppsAgencyRegisterApiService.getHospitals).toHaveBeenCalledWith({}, { highSecurity: false })
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllHospitals(req, res)

      expect(req.session.allListPageLink).toEqual('/hospital-register')
    })
  })

  describe('viewHospital', () => {
    beforeEach(() => {
      hmppsAgencyRegisterApiService.getHospital.mockResolvedValue(data.hospital({ hospitalId: 'SHEFH' }))
      req.query.id = 'SHEFH'
    })

    it('will render hospital page with hospital', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.viewHospital(req, res)

      expect(hmppsAgencyRegisterApiService.getHospital).toHaveBeenCalledWith({ username: 'tom' }, 'SHEFH')
      expect(res.render).toHaveBeenCalledWith(
        'pages/hospital-register/hospitalDetails',
        expect.objectContaining({
          hospital: expect.objectContaining({ hospitalId: 'SHEFH' }),
        }),
      )
    })

    it('it will call register service with hospital Id parameter', async () => {
      await controller.viewHospital(req, res)

      expect(hmppsAgencyRegisterApiService.getHospital).toHaveBeenCalledWith({}, 'SHEFH')
    })
  })
})
