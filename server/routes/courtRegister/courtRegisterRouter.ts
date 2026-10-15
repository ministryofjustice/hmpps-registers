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
  get('/court-register/cjit-code/update', (req, res) => courtRegisterController.updateCjitCode(req, res))
  post('/court-register/cjit-code/update', (req, res) => courtRegisterController.submitUpdateCjitCode(req, res))
  get('/court-register/name-description/update', (req, res) => courtRegisterController.updateNameDescription(req, res))
  post('/court-register/name-description/update', (req, res) =>
    courtRegisterController.submitUpdateNameDescription(req, res),
  )
  get('/court-register/court-type/update', (req, res) => courtRegisterController.updateCourtType(req, res))
  post('/court-register/court-type/update', (req, res) => courtRegisterController.submitUpdateCourtType(req, res))
  get('/court-register/accessible-access/update', (req, res) =>
    courtRegisterController.updateAccessibleAccess(req, res),
  )
  post('/court-register/accessible-access/update', (req, res) =>
    courtRegisterController.submitUpdateAccessibleAccess(req, res),
  )
  get('/court-register/address/create', (req, res) => courtRegisterController.addAddress(req, res))
  post('/court-register/address/create', (req, res) => courtRegisterController.submitAddAddress(req, res))
  get('/court-register/address/update', (req, res) => courtRegisterController.updateAddress(req, res))
  post('/court-register/address/update', (req, res) => courtRegisterController.submitUpdateAddress(req, res))
  get('/court-register/phone/create', (req, res) => courtRegisterController.addPhone(req, res))
  post('/court-register/phone/create', (req, res) => courtRegisterController.submitAddPhone(req, res))
  get('/court-register/phone/update', (req, res) => courtRegisterController.updatePhone(req, res))
  post('/court-register/phone/update', (req, res) => courtRegisterController.submitUpdatePhone(req, res))
  get('/court-register/phone/delete', (req, res) => courtRegisterController.deletePhone(req, res))
  post('/court-register/phone/delete', (req, res) => courtRegisterController.submitDeletePhone(req, res))
  get('/court-register/email/create', (req, res) => courtRegisterController.addEmail(req, res))
  post('/court-register/email/create', (req, res) => courtRegisterController.submitAddEmail(req, res))
  get('/court-register/email/update', (req, res) => courtRegisterController.updateEmail(req, res))
  post('/court-register/email/update', (req, res) => courtRegisterController.submitUpdateEmail(req, res))
  get('/court-register/email/delete', (req, res) => courtRegisterController.deleteEmail(req, res))
  post('/court-register/email/delete', (req, res) => courtRegisterController.submitDeleteEmail(req, res))

  return router
}
