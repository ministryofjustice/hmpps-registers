import express from 'express'

import addRequestId from 'express-request-id'
import helmet from 'helmet'
import csurf from 'csurf'
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

const version = Date.now().toString()
const production = process.env.NODE_ENV === 'production'
const testMode = process.env.NODE_ENV === 'test'
const RedisStore = connectRedis(session)

export default function createApp(
  userService: UserService,
  courtRegisterService: CourtRegisterService,
  prisonRegisterService: PrisonRegisterService
): express.Application {
  const app = express()

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  nunjucksSetup(app)

  // Server Configuration
  app.set('port', process.env.PORT || 3000)

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", 'code.jquery.com', "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
    })
  )

  app.use(addRequestId())

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

  app.use(setUpAuthentication())
  app.use(setUpWebRequestParsing())

  app.use(setUpStaticResources())

  // Cachebusting version string
  if (production) {
    // Version only changes on reboot
    app.locals.version = version
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  app.use(setUpHealthChecks())

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'HMPPS Registers'

  app.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  app.use(authorisationMiddleware([MAINTAINER_ROLE]))
  app.use('/', indexRoutes(standardRouter(userService), { courtRegisterService, prisonRegisterService }))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
