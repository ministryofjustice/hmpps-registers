import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import HospitalRegisterController from './hospitalRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const hospitalRegisterController = new HospitalRegisterController(services.prisonRegisterService)

  get('/hospital-register', (req, res) => hospitalRegisterController.showAllHospitals(req, res))
  get('/hospital-register/details', (req, res) => hospitalRegisterController.viewHospital(req, res))

  return router
}
