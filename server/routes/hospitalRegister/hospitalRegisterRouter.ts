import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import HospitalRegisterController from './hospitalRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const hospitalRegisterController = new HospitalRegisterController(services.hmppsAgencyRegisterApiService)

  get('/hospital-register', (req, res) => hospitalRegisterController.showAllHospitals(req, res))
  get('/hospital-register/details', (req, res) => hospitalRegisterController.viewHospital(req, res))

  return router
}
