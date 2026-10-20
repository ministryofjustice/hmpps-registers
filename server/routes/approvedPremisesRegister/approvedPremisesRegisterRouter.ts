import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ApprovedPremisesRegisterController from './approvedPremisesRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const approvedPremisesRegisterController = new ApprovedPremisesRegisterController(
    services.hmppsAgencyRegisterApiService,
  )

  get('/approved-premises-register', (req, res) => approvedPremisesRegisterController.showAllApprovedPremises(req, res))
  get('/approved-premises-register/details', (req, res) =>
    approvedPremisesRegisterController.viewApprovedPremises(req, res),
  )

  return router
}
