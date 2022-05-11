import express from 'express'

import createError from 'http-errors'
import session from 'express-session'
import connectRedis from 'connect-redis'

import indexRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import config from './config'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import type UserService from './services/userService'
import CourtRegisterService from './services/courtRegisterService'
import PrisonRegisterService from './services/prisonRegisterService'
import { MAINTAINER_ROLE } from './authentication/roles'
import { createRedisClient } from './data/redisClient'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import { metricsMiddleware } from './monitoring/metricsApp'
import setUpWebSession from './middleware/setUpWebSession'

const RedisStore = connectRedis(session)

export default function createApp(
  userService: UserService,
  courtRegisterService: CourtRegisterService,
  prisonRegisterService: PrisonRegisterService
): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(metricsMiddleware)
  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())

  const client = createRedisClient('index/app.ts', undefined)

  app.use(
    session({
      store: new RedisStore({ client }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware([MAINTAINER_ROLE]))

  app.use('/', indexRoutes(standardRouter(userService), { courtRegisterService, prisonRegisterService }))

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
