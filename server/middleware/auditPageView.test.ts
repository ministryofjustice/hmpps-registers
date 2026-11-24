import express, { type Express, type Request, type Response } from 'express'
import { NotFound } from 'http-errors'
import request from 'supertest'

import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import auditPageView from './auditPageView'
import authorisationMiddleware from './authorisationMiddleware'
import nunjucksSetup from '../utils/nunjucksSetup'
import errorHandler from '../errorHandler'
import { MAINTAINER_ROLE } from '../authentication/roles'

jest.mock('@ministryofjustice/hmpps-audit-client')

let auditService: jest.Mocked<AuditService>

function tokenWithRoles(roles: string[]): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode({ authorities: roles })}.signature`
}

/** a cut-down app with the middleware in the same place as app.ts: after authentication, before authorisation */
function appWithAuditing({
  roles = [MAINTAINER_ROLE],
  username = 'USER1',
}: { roles?: string[]; username?: string } = {}): Express {
  const app = express()
  nunjucksSetup(app)
  app.use((req, res, next) => {
    req.id = 'correlation-id'
    res.locals.user = username ? { username, token: tokenWithRoles(roles) } : undefined
    next()
  })
  app.get('*any', auditPageView(auditService))
  app.use(authorisationMiddleware([MAINTAINER_ROLE]))
  app.get('/prison-register/details', (req, res) => res.render('autherror'))
  app.get('/prison-register/start', (req, res) => res.redirect('/prison-register/details'))
  app.get('/api/search-town', (req, res) => {
    res.json([])
  })
  app.use((req, res, next) => next(new NotFound()))
  app.use(errorHandler(false))
  return app
}

/** audit events logged, in the order the audit service saw them */
function loggedEvents() {
  return auditService.logAuditEvent.mock.calls.map(([event]) => event.what)
}

beforeEach(() => {
  auditService = new AuditService(null as never) as jest.Mocked<AuditService>
  auditService.logAuditEvent.mockResolvedValue(undefined)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('auditPageView', () => {
  it('logs a page view and an access attempt when a page renders', async () => {
    await request(appWithAuditing()).get('/prison-register/details').expect(200)

    expect(loggedEvents()).toEqual(['VIEW_REGISTERS_PAGE_SUCCESS', 'VIEW_REGISTERS_PAGE_ATTEMPT'])
  })

  it('passes the username, correlation id, subject type and page path to the audit service without throwing on failure', async () => {
    await request(appWithAuditing()).get('/prison-register/details?id=MDI').expect(200)

    expect(auditService.logAuditEvent).toHaveBeenCalledTimes(2)
    auditService.logAuditEvent.mock.calls.forEach(([event, options]) => {
      expect(event).toEqual({
        what: expect.any(String),
        who: 'USER1',
        correlationId: 'correlation-id',
        subjectType: 'NOT_APPLICABLE',
        details: { pageUrl: '/prison-register/details' },
      })
      expect(options).toEqual({ throwOnError: false, logOnError: true })
    })
  })

  it('logs only an attempt when the user does not have the maintainer role', async () => {
    await request(appWithAuditing({ roles: ['ROLE_SOMETHING_ELSE'] }))
      .get('/prison-register/details')
      .expect(302)
      .expect('Location', '/authError')

    expect(loggedEvents()).toEqual(['VIEW_REGISTERS_PAGE_ATTEMPT'])
  })

  it('logs only an attempt for a redirect', async () => {
    await request(appWithAuditing()).get('/prison-register/start').expect(302)

    expect(loggedEvents()).toEqual(['VIEW_REGISTERS_PAGE_ATTEMPT'])
  })

  it('logs only an attempt when the page is not found', async () => {
    await request(appWithAuditing()).get('/missing').expect(404)

    expect(loggedEvents()).toEqual(['VIEW_REGISTERS_PAGE_ATTEMPT'])
  })

  it('passes render errors to the error handler rather than swallowing them', async () => {
    const app = appWithAuditing()
    // fail the page template only; the error page then renders as normal
    jest
      .spyOn(app, 'render')
      .mockImplementationOnce(((_view: string, _options: object, callback: (err: Error) => void) =>
        callback(new Error('render failed'))) as typeof app.render)

    await request(app).get('/prison-register/details').expect(500)

    expect(loggedEvents()).toEqual(['VIEW_REGISTERS_PAGE_ATTEMPT'])
  })

  it('does not audit the address look-ups behind the autocomplete fields', async () => {
    await request(appWithAuditing()).get('/api/search-town?query=Lon').expect(200)

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit when there is no signed-in user', async () => {
    await request(appWithAuditing({ username: '' })).get('/prison-register/details')

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('still serves the page when auditing fails', async () => {
    auditService.logAuditEvent.mockRejectedValue(new Error('SQS is down'))

    await request(appWithAuditing()).get('/prison-register/details').expect(200)
  })

  // no page in the service renders this way, so this calls the middleware directly
  it('leaves renders that pass their own callback alone', () => {
    const render = jest.fn()
    const req = { originalUrl: '/', query: {} } as Request
    const res = {
      locals: { user: { username: 'USER1' } },
      render,
      prependOnceListener: jest.fn(),
    } as unknown as Response
    auditPageView(auditService)(req, res, jest.fn())

    const callback = jest.fn()
    res.render('emails/template', {}, callback)

    expect(render).toHaveBeenCalledWith('emails/template', {}, callback)
    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })
})
