import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OtherAgencyRegisterController from './otherAgencyRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const otherAgencyRegisterController = new OtherAgencyRegisterController(services.hmppsAgencyRegisterApiService)

  get('/other-agency-register', (req, res) => otherAgencyRegisterController.showAllOtherAgencies(req, res))
  get('/other-agency-register/details', (req, res) => otherAgencyRegisterController.viewOtherAgency(req, res))

  return router
}
