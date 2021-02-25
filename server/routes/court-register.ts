import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'

export default function routes(router: Router): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/court-register', (req, res, next) => {
    res.render('pages/court-register')
  })

  return router
}
