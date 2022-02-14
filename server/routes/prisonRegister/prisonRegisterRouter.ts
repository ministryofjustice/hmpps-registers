import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PrisonRegisterController from './prisonRegisterController'
import CourtRegisterService from '../../services/courtRegisterService'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  courtRegisterService: CourtRegisterService
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const prisonRegisterController = new PrisonRegisterController(services.prisonRegisterService)

  get('/prison-register', (req, res) => prisonRegisterController.showAllPrisons(req, res))

  return router
}
