import express, { type Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './routes/testutils/appSetup'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError: Not Found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not Found')
      })
  })
})

describe('errors from API calls', () => {
  /** an error as thrown by the shared REST client when an API responds with an error status */
  const apiError = (responseStatus: number) => Object.assign(new Error('API error'), { responseStatus })

  const appFailingWith = (error: Error): Express => {
    const failingApp = express()
    nunjucksSetup(failingApp)
    failingApp.get('/', () => {
      throw error
    })
    failingApp.use(errorHandler(false))
    return failingApp
  }

  it('responds with the status the API gave', () => {
    return request(appFailingWith(apiError(404)))
      .get('/')
      .expect(404)
  })

  it.each([401, 403])('signs the user out when the API responds %s', status => {
    return request(appFailingWith(apiError(status)))
      .get('/')
      .expect(302)
      .expect('Location', '/sign-out')
  })

  it('responds 500 for other errors', () => {
    return request(appFailingWith(new Error('something broke')))
      .get('/')
      .expect(500)
  })
})
