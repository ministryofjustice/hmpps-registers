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
  it('should render prison register page', () => {
    return request(app)
      .get('/prison-register')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Prison Register')
      })
  })
  it("should render 'Add Welsh prison address for' page", () => {
    return request(app)
      .get('/prison-register/add-welsh-prison-address-start')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add Welsh prison address for')
      })
  })

  it("should render 'add-welsh-prison-address' page", () => {
    return request(app)
      .get('/prison-register/add-welsh-prison-address')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add Welsh prison address for')
      })
  })
})
