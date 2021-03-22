import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes from '../testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render court register page', () => {
    return request(app)
      .get('/court-register')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Court Register')
      })
  })
})
describe('GET /add', () => {
  it('should render add new court start page', () => {
    return request(app)
      .get('/court-register/add')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a new court')
      })
  })
})
