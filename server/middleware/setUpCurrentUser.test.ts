import express from 'express'
import request from 'supertest'
import { Span, trace } from '@opentelemetry/api'
import setUpCurrentUser from './setUpCurrentUser'

describe('setUpCurrentUser', () => {
  it('adds the authenticated user UUID to the active telemetry span', async () => {
    const userUuid = '12345-12345-12345-12345-12345'
    const setAttribute = jest.fn()
    jest.spyOn(trace, 'getActiveSpan').mockReturnValue({ setAttribute } as unknown as Span)

    const tokenHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const tokenPayload = Buffer.from(
      JSON.stringify({ user_id: '123', uuid: userUuid, name: 'Test User', authorities: [] }),
    ).toString('base64url')
    const app = express()

    app.use((req, res, next) => {
      res.locals.user = {
        token: `${tokenHeader}.${tokenPayload}.signature`,
        username: 'test-user',
        authSource: 'nomis',
      }
      next()
    })
    app.use(setUpCurrentUser())
    app.get('/', (_req, res) => res.sendStatus(200))

    await request(app).get('/').expect(200)

    expect(setAttribute).toHaveBeenCalledWith('userUuid', userUuid)
  })
})
