import type { Request, Response, NextFunction } from 'express'
import type { HttpError } from 'http-errors'
import type { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import logger from '../logger'

export default function createErrorHandler(production: boolean) {
  return (error: HttpError | SanitisedError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    // errors raised here have a status; errors from API calls have the API's response status
    const status = 'responseStatus' in error ? error.responseStatus : (error as HttpError).status

    if (status === 401 || status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = status
    res.locals.stack = production ? null : error.stack

    res.status(status || 500)

    return res.render('pages/error')
  }
}
