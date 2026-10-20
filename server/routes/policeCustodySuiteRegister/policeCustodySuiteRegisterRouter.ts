import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PoliceCustodySuiteRegisterController from './policeCustodySuiteRegisterController'
import HMPPSAgencyRegisterApi from '../../services/hmppsAgencyRegisterApi'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  hmppsAgencyRegisterApiService: HMPPSAgencyRegisterApi
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const policeCustodySuiteRegisterController = new PoliceCustodySuiteRegisterController(
    services.hmppsAgencyRegisterApiService,
  )

  get('/police-custody-suite-register', (req, res) =>
    policeCustodySuiteRegisterController.showAllPoliceCustodySuites(req, res),
  )
  get('/police-custody-suite-register/details', (req, res) =>
    policeCustodySuiteRegisterController.viewPoliceCustodySuite(req, res),
  )

  return router
}
