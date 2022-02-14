import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../../middleware/asyncMiddleware'
import CourtRegisterController from './courtRegisterController'
import CourtRegisterService from '../../services/courtRegisterService'
import PrisonRegisterService from '../../services/prisonRegisterService'

export interface Services {
  courtRegisterService: CourtRegisterService
  prisonRegisterService: PrisonRegisterService
}
export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const courtRegisterController = new CourtRegisterController(services.courtRegisterService)

  get('/court-register', (req, res) => courtRegisterController.showAllCourts(req, res))
  get('/court-register/details', (req, res) => courtRegisterController.viewCourt(req, res))
  post('/court-register/toggle-court-active', (req, res) => courtRegisterController.toggleCourtActive(req, res))
  post('/court-register/toggle-building-active', (req, res) => courtRegisterController.toggleBuildingActive(req, res))
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
  get('/court-register/amend-court-details-start', (req, res) =>
    courtRegisterController.amendCourtDetailsStart(req, res)
  )
  get('/court-register/amend-court-details', (req, res) => courtRegisterController.amendCourtDetails(req, res))
  post('/court-register/amend-court-details', (req, res) => courtRegisterController.submitAmendCourtDetails(req, res))
  get('/court-register/amend-court-building-start', (req, res) =>
    courtRegisterController.amendCourtBuildingStart(req, res)
  )
  get('/court-register/amend-court-building', (req, res) => courtRegisterController.amendCourtBuilding(req, res))
  post('/court-register/amend-court-building', (req, res) => courtRegisterController.submitAmendCourtBuilding(req, res))
  get('/court-register/add-court-building-start', (req, res) => courtRegisterController.addCourtBuildingStart(req, res))
  get('/court-register/add-court-building', (req, res) => courtRegisterController.addCourtBuilding(req, res))
  post('/court-register/add-court-building', (req, res) => courtRegisterController.submitAddCourtBuilding(req, res))
  get('/court-register/amend-court-building-contacts-start', (req, res) =>
    courtRegisterController.amendCourtBuildingContactsStart(req, res)
  )
  get('/court-register/amend-court-building-contacts', (req, res) =>
    courtRegisterController.amendCourtBuildingContacts(req, res)
  )
  post('/court-register/amend-court-building-contacts', (req, res) =>
    courtRegisterController.submitAmendCourtBuildingContacts(req, res)
  )

  return router
}
