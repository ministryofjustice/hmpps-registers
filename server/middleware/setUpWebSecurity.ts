import express, { Router } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", '*.google-analytics.com'],
          styleSrc: ["'self'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", config.apis.frontendComponents.url],
        },
      },
    }),
  )
  return router
}
