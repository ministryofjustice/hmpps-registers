import type { AuditService } from '@ministryofjustice/hmpps-audit-client'
import type { RequestHandler } from 'express'

import logger from '../../logger'

/**
 * Requests that are not page views: the address look-ups behind the autocomplete fields, which return JSON
 * as the user types. Health checks, static resources and the sign-in pages are mounted earlier in app.ts so
 * never reach here.
 */
const notPageViews = [/^\/api\//]

/** Pages that are rendered but are not a successful view */
const notSuccessfulViews = ['pages/error']

type RenderCallback = (err: Error, html: string) => void
type ResRender = (view: string, options?: object | RenderCallback, callback?: RenderCallback) => void

/**
 * Audits page views to HMPPS Audit.
 *
 * Emits VIEW_REGISTERS_PAGE_ATTEMPT once the response closes – covering redirects, errors and
 * requests refused by the authorisation middleware – and VIEW_REGISTERS_PAGE_SUCCESS when a page
 * renders successfully.
 *
 * The registers hold organisations rather than people, so every event has the subject type NOT_APPLICABLE.
 * The page path is recorded without the query string.
 *
 * Mount after authentication but before authorisation, so that refused requests are still
 * recorded as attempts.
 */
export default function auditPageView(auditService: AuditService): RequestHandler {
  return (req, res, next) => {
    const who = res.locals.user?.username
    if (!who || notPageViews.some(pattern => pattern.test(req.originalUrl))) {
      next()
      return
    }

    res.locals.auditEvent = {
      who,
      correlationId: req.id,
      subjectType: 'NOT_APPLICABLE',
      details: { pageUrl: req.originalUrl.split('?')[0] },
    }

    res.prependOnceListener('close', () => {
      logPageView(auditService, res.locals.auditEvent, true)
    })

    const resRender = res.render.bind(res) as ResRender
    res.render = ((view: string, options?: object | RenderCallback, callback?: RenderCallback) => {
      if (typeof options === 'function' || callback) {
        // the caller handles the rendered html itself, so this is not a page being sent to the user
        resRender(view, options, callback)
        return
      }
      resRender(view, options, (err: Error, html: string) => {
        if (err) {
          next(err)
          return
        }
        // send the page first: auditing must never delay or break rendering
        res.send(html)
        if (res.statusCode < 400 && !notSuccessfulViews.includes(view)) {
          logPageView(auditService, res.locals.auditEvent)
        }
      })
    }) as typeof res.render

    next()
  }
}

function logPageView(auditService: AuditService, auditEvent: Express.Locals['auditEvent'], isAttempt = false): void {
  if (!auditEvent) return
  // auditing must not be able to break page rendering, so never throw
  auditService
    .logAuditEvent(
      { ...auditEvent, what: isAttempt ? 'VIEW_REGISTERS_PAGE_ATTEMPT' : 'VIEW_REGISTERS_PAGE_SUCCESS' },
      { throwOnError: false, logOnError: true },
    )
    .catch(error => {
      logger.error(error, 'Failed to audit page view')
    })
}
