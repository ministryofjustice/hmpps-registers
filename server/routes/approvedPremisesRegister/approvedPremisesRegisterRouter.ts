import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ApprovedPremisesRegisterController from './approvedPremisesRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const approvedPremisesRegisterController = new ApprovedPremisesRegisterController(services.prisonRegisterService)

  get('/approved-premises-register', (req, res) => approvedPremisesRegisterController.showAllApprovedPremises(req, res))
  get('/approved-premises-register/details', (req, res) =>
    approvedPremisesRegisterController.viewApprovedPremises(req, res),
  )

  return router
}
