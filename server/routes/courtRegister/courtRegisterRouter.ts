import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtRegisterController from './courtRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const courtRegisterController = new CourtRegisterController(services.prisonRegisterService)

  get('/court-register', (req, res) => courtRegisterController.showAllCourts(req, res))
  get('/court-register/details', (req, res) => courtRegisterController.viewCourt(req, res))
  get('/court-register/email/create', (req, res) => courtRegisterController.addEmail(req, res))
  post('/court-register/email/create', (req, res) => courtRegisterController.submitAddEmail(req, res))
  get('/court-register/email/update', (req, res) => courtRegisterController.updateEmail(req, res))
  post('/court-register/email/update', (req, res) => courtRegisterController.submitUpdateEmail(req, res))

  return router
}
