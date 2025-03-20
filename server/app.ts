import express from 'express'

import createError from 'http-errors'
import indexRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import type UserService from './services/userService'
import PrisonRegisterService from './services/prisonRegisterService'
import { MAINTAINER_ROLE } from './authentication/roles'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import { metricsMiddleware } from './monitoring/metricsApp'
import setUpWebSession from './middleware/setUpWebSession'
import setUpCurrentUser from './middleware/setUpCurrentUser'

export default function createApp(
  userService: UserService,
  prisonRegisterService: PrisonRegisterService,
): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware([MAINTAINER_ROLE]))
  app.use(setUpCurrentUser())

  app.use('/', indexRoutes(standardRouter(userService), { prisonRegisterService }))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
