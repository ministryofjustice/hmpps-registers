import { RequestHandler } from 'express'
import { extractRoles } from '../authentication/roles'

import logger from '../../logger'

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (res.locals && res.locals.user && res.locals.user.token) {
      const roles = extractRoles(res)

      if (authorisedRoles.length && !roles.some(role => authorisedRoles.includes(role))) {
        logger.error('User is not authorised to access this')
        return res.redirect('/authError')
      }

      return next()
    }

    req.session.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
