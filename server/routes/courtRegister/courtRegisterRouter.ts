import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtRegisterController from './courtRegisterController'
import CourtRegisterService from '../../services/courtRegisterService'

export interface Services {
  courtRegisterService: CourtRegisterService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const courtRegisterController = new CourtRegisterController(services.courtRegisterService)

  get('/court-register', (req, res) => courtRegisterController.showAllCourts(req, res))
  get('/court-register/paged', (req, res) => courtRegisterController.showAllCourtsPaged(req, res))
  get('/court-register/details', (req, res) => courtRegisterController.viewCourt(req, res))
  post('/court-register/toggle-active', (req, res) => courtRegisterController.toggleCourtActive(req, res))
  get('/court-register/add', (req, res) => courtRegisterController.addNewCourtStart(req, res))
  get('/court-register/add-new-court-details', (req, res) => courtRegisterController.addNewCourtDetails(req, res))
  post('/court-register/add-new-court-details', (req, res) => courtRegisterController.submitNewCourtDetails(req, res))
  get('/court-register/add-new-court-building', (req, res) => courtRegisterController.addNewCourtBuilding(req, res))
  post('/court-register/add-new-court-building', (req, res) =>
    courtRegisterController.submitNewCourtNewBuilding(req, res)
  )
  get('/court-register/add-new-court-contact-details', (req, res) =>
    courtRegisterController.addNewCourtContactDetails(req, res)
  )
  post('/court-register/add-new-court-contact-details', (req, res) =>
    courtRegisterController.submitNewCourtContactDetails(req, res)
  )
  get('/court-register/add-new-court-summary', (req, res) => courtRegisterController.addNewCourtSummary(req, res))
  post('/court-register/add-new-court-finished', (req, res) => courtRegisterController.submitNewCourtSummary(req, res))
  get('/court-register/add-new-court-finished', (req, res) => courtRegisterController.addNewCourtFinished(req, res))

  return router
}
