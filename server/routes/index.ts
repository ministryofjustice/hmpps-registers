import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import courtRoutes from './courtRegister'
import CourtRegisterService from '../services/courtRegisterService'

export interface Services {
  courtRegisterService: CourtRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res) => {
    res.render('pages/index')
  })

  courtRoutes(router, services)
  return router
}
