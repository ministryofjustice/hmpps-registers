import { Router } from 'express'
import { type AuthenticatedRequest, VerificationClient } from '@ministryofjustice/hmpps-auth-clients'

import { csrfSync } from 'csrf-sync'
import auth from '../authentication/auth'
import config from '../config'
import logger from '../../logger'
import populateCurrentUser from '../middleware/populateCurrentUser'
import type UserService from '../services/userService'

const testMode = process.env.NODE_ENV === 'test'

export default function standardRouter(userService: UserService): Router {
  const router = Router({ mergeParams: true })

  const tokenVerificationClient = new VerificationClient(config.apis.tokenVerification, logger)
  router.use(
    auth.authenticationMiddleware(req => tokenVerificationClient.verifyToken(req as unknown as AuthenticatedRequest)),
  )
  router.use(populateCurrentUser(userService))

  // CSRF protection
  if (!testMode) {
    const {
      csrfSynchronisedProtection, // This is the default CSRF protection middleware.
    } = csrfSync({
      // By default, csrf-sync uses x-csrf-token header, but we use the token in forms and send it in the request body, so change getTokenFromRequest so it grabs from there
      getTokenFromRequest: req => {
        // eslint-disable-next-line no-underscore-dangle
        return req.body._csrf || req.query._csrf
      },
    })
    router.use(csrfSynchronisedProtection)
  }

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
