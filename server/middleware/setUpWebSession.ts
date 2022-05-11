import express, { Router } from 'express'

export default function setUpWebSession(): Router {
  const router = express.Router()

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  router.use((req, res, next) => {
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  return router
}
