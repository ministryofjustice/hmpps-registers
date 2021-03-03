import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtRegisterController from './courtRegisterController'
import CourtRegisterService from '../../services/courtRegisterService'

export interface Services {
  courtRegisterService: CourtRegisterService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const courtRegisterController = new CourtRegisterController(services.courtRegisterService)

  get('/court-register', (req, res) => courtRegisterController.showAllCourts(req, res))
  get('/court-register/details', (req, res) => courtRegisterController.viewCourt(req, res))
  return router
}
