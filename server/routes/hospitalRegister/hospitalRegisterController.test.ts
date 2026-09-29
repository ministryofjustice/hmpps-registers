import type { Request, Response } from 'express'
import PrisonRegisterService from '../../services/prisonRegisterService'
import HospitalRegisterController from './hospitalRegisterController'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import data from '../testutils/mockHospitalData'

jest.mock('../../services/prisonRegisterService')

describe('Hospital Register controller', () => {
  let prisonRegisterService: jest.Mocked<PrisonRegisterService>
  let controller: HospitalRegisterController
  let req: Request
  let res: Response

  beforeEach(() => {
    prisonRegisterService = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    controller = new HospitalRegisterController(prisonRegisterService)
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
      prisonRegisterService.getHospitals.mockResolvedValue([data.hospital({ hospitalId: 'SHEFH' })])
    })

    it('will render all hospitals page with hospitals', async () => {
      res.locals.user = {
        username: 'tom',
      }
      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({ username: 'tom' }, {})
      expect(res.render).toHaveBeenCalledWith(
        'pages/hospital-register/allHospitals',
        expect.objectContaining({
          hospitals: [expect.objectContaining({ id: 'SHEFH' })],
        }),
      )
    })

    it('it will call register service with no filter params', async () => {
      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({}, {})
    })

    it('it will call register service with active filter param', async () => {
      req.query.active = 'true'

      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({}, { active: true })
    })

    it('it will call register service with textSearch filter param', async () => {
      req.query.textSearch = 'Sheffield'

      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({}, { textSearch: 'Sheffield' })
    })

    it('it will call register service with high security true filter param', async () => {
      req.query.highSecurity = 'true'

      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({}, { highSecurity: true })
    })

    it('it will call register service with high security false filter param', async () => {
      req.query.highSecurity = 'false'

      await controller.showAllHospitals(req, res)

      expect(prisonRegisterService.getHospitals).toHaveBeenCalledWith({}, { highSecurity: false })
    })

    it('will set the list page link in the session', async () => {
      await controller.showAllHospitals(req, res)

      expect(req.session.allListPageLink).toEqual('/hospital-register')
    })
  })
})
