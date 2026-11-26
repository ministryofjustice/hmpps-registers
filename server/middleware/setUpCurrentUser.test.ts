import express from 'express'
import request from 'supertest'
import setUpCurrentUser from './setUpCurrentUser'

describe('setUpCurrentUser', () => {
  it('adds the authenticated user UUID to the current user', async () => {
    const userUuid = '12345-12345-12345-12345-12345'

    const tokenHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')
    const tokenPayload = Buffer.from(
      JSON.stringify({ user_id: '123', user_uuid: userUuid, name: 'Test User', authorities: [] }),
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
    app.get('/', (_req, res) => res.json(res.locals.user))

    const response = await request(app).get('/').expect(200)

    expect(response.body.userUuid).toEqual(userUuid)
  })
})
