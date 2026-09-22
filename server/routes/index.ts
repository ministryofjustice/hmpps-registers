import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import prisonRoutes from './prisonRegister/prisonRegisterRouter'
import courtRoutes from './courtRegister/courtRegisterRouter'
import PrisonRegisterService from '../services/prisonRegisterService'
import { extractRoles, MAINTAINER_ROLE } from '../authentication/roles'
import config from '../config'

export interface Services {
  prisonRegisterService: PrisonRegisterService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', (req, res) => {
    const roles = extractRoles(res)
    res.render('pages/index', {
      registers: [
        {
          id: 'prison-register',
          heading: 'Prison register',
          description: 'View prison details.',
          href: '/prison-register',
          roles: [MAINTAINER_ROLE],
          enabled: true,
        },
        {
          id: 'court-register',
          heading: 'Court register',
          description: 'View court details.',
          href: '/court-register',
          roles: [MAINTAINER_ROLE],
          enabled: config.agencyRegistersEnabled,
        },
      ].filter(
        register =>
          Boolean(register.roles === null || register.roles.find(role => roles.includes(role))) && register.enabled,
      ),
    })
  })

  prisonRoutes(router, services)
  courtRoutes(router, services)
  return router
}
