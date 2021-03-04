import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import courtRoutes from './courtRegister/courtRegisterRouter'
import CourtRegisterService from '../services/courtRegisterService'
import { extractRoles, MAINTAINER_ROLE } from '../authentication/roles'

export interface Services {
  courtRegisterService: CourtRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res) => {
    const roles = extractRoles(res)
    res.render('pages/index', {
      registers: [
        {
          id: 'court-register',
          heading: 'Court register',
          description: 'View and amend court details. This also includes the ability to record a court as closed',
          href: '/court-register',
          roles: [MAINTAINER_ROLE],
          enabled: true,
        },
      ].filter(
        register =>
          Boolean(register.roles === null || register.roles.find(role => roles.includes(role))) && register.enabled
      ),
    })
  })

  courtRoutes(router, services)
  return router
}
