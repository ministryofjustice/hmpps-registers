import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ProbationOfficeRegisterController from './probationOfficeRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const probationOfficeRegisterController = new ProbationOfficeRegisterController(services.prisonRegisterService)

  get('/probation-office-register', (req, res) => probationOfficeRegisterController.showAllProbationOffices(req, res))
  get('/probation-office-register/details', (req, res) =>
    probationOfficeRegisterController.viewProbationOffice(req, res),
  )

  return router
}
