import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PrisonRegisterController from './prisonRegisterController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const prisonRegisterController = new PrisonRegisterController(services.prisonRegisterService)

  get('/prison-register', (req, res) => prisonRegisterController.showAllPrisons(req, res))
  get('/prison-register/details', (req, res) => prisonRegisterController.viewPrison(req, res))

  get('/prison-register/amend-prison-details-start', (req, res) =>
    prisonRegisterController.amendPrisonDetailsStart(req, res)
  )
  get('/prison-register/amend-prison-details', (req, res) => prisonRegisterController.amendPrisonDetails(req, res))
  post('/prison-register/amend-prison-details', (req, res) =>
    prisonRegisterController.submitAmendPrisonDetails(req, res)
  )

  get('/prison-register/add-prison-address-start', (req, res) => prisonRegisterController.addPrisonAddressStart(req, res))

  get('/prison-register/amend-prison-address-start', (req, res) =>
    prisonRegisterController.amendPrisonAddressStart(req, res)
  )
  get('/prison-register/amend-prison-address', (req, res) => prisonRegisterController.amendPrisonAddress(req, res))
  post('/prison-register/amend-prison-address', (req, res) =>
    prisonRegisterController.submitAmendPrisonAddress(req, res)
  )
  post('/prison-register/toggle-prison-active', (req, res) => prisonRegisterController.togglePrisonActive(req, res))

  return router
}
