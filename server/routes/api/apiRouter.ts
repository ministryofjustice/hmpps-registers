import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import ApiController from './apiController'
import PrisonRegisterService from '../../services/prisonRegisterService'

// include this here otherwise TS complains about cyclical dependencies
export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const apiController = new ApiController(services.prisonRegisterService)

  get('/api/search-town', (req, res) => apiController.searchTown(req, res))
  get('/api/search-area', (req, res) => apiController.searchArea(req, res))
  get('/api/search-payroll-region', (req, res) => apiController.searchPayrollRegion(req, res))
  get('/api/search-local-authority', (req, res) => apiController.searchLocalAuthority(req, res))
  get('/api/search-region', (req, res) => apiController.searchRegion(req, res))
  get('/api/search-county', (req, res) => apiController.searchCounty(req, res))

  return router
}
