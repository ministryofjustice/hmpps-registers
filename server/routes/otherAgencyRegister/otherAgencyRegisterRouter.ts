import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OtherAgencyRegisterController from './otherAgencyRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const otherAgencyRegisterController = new OtherAgencyRegisterController(services.prisonRegisterService)

  get('/other-agency-register', (req, res) => otherAgencyRegisterController.showAllOtherAgencies(req, res))

  return router
}
