import type { Router } from 'express'
import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import config from '../config'
import auth from '../authentication/auth'

const router = express.Router()

export default function setUpAuth(): Router {
  auth.init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: req.session.returnTo || '/',
      failureRedirect: '/autherror',
    })(req, res, next)
  )

  const authSignOutUrl = `${config.apis.hmppsAuth.externalUrl}/sign-out?client_id=${config.apis.hmppsAuth.systemClientId}&redirect_uri=${config.domain}`

  router.use('/sign-out', (req, res) => {
    if (req.user) {
      req.logout()
      req.session.destroy(() => res.redirect(authSignOutUrl))
      return
    }
    res.redirect(authSignOutUrl)
  })

  router.use('/auth', (req, res) => {
    res.redirect(`${config.apis.hmppsAuth.externalUrl}`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
