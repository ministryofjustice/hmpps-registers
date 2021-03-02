import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'

let app

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
