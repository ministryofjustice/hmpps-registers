import crypto from 'crypto'
import express, { Router } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })
  router.use((req, res, next) =>
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", `'nonce-${res.locals.cspNonce}'`, '*.google-analytics.com'],
          styleSrc: ["'self'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", config.apis.frontendComponents.url],
        },
      },
    })(req, res, next),
  )
  return router
}
