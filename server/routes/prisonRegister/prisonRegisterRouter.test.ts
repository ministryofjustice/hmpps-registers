import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes from '../testutils/appSetup'
import config from '../../config'
import hmppsAgencyRegisterApiService from '../testutils/mockHmppsAgencyRegisterApi'

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
  it("should render 'Amend Welsh prison address for' page", () => {
    return request(app)
      .get('/prison-register/amend-welsh-prison-address-start')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Amend Welsh address details for')
      })
  })
  it("should render to 'Add Welsh prison address for' page on redirect", () => {
    return request(app)
      .get('/prison-register/add-welsh-prison-address')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add Welsh prison address for')
      })
  })
})

describe('adding a new prison', () => {
  const addPages: Array<['get' | 'post', string]> = [
    ['get', '/prison-register/add'],
    ['get', '/prison-register/add-new-prison-details'],
    ['post', '/prison-register/add-new-prison-details'],
    ['get', '/prison-register/add-new-prison-address'],
    ['post', '/prison-register/add-new-prison-address'],
    ['get', '/prison-register/add-new-prison-summary'],
    ['post', '/prison-register/add-new-prison-finished'],
    ['get', '/prison-register/add-new-prison-finished'],
  ]

  const guidance =
    'New prisons are created in NOMIS. They then appear in this list, where you can add their types, categories, operator and other details.'

  beforeEach(() => {
    hmppsAgencyRegisterApiService.getPrisonsWithFilter.mockResolvedValue([])
    hmppsAgencyRegisterApiService.getPrisonOperators.mockResolvedValue([{ id: 1, name: 'PSP' }])
  })

  afterEach(() => {
    config.prisonRegisterAddEnabled = false
  })

  describe('when switched off, as in production', () => {
    beforeEach(() => {
      config.prisonRegisterAddEnabled = false
      app = appWithAllRoutes({})
    })

    it('does not offer the "Add a new prison" button', () => {
      return request(app)
        .get('/prison-register')
        .expect(200)
        .expect(res => expect(res.text).not.toContain('Add a new prison'))
    })

    it('explains that new prisons are created in NOMIS', () => {
      return request(app)
        .get('/prison-register')
        .expect(200)
        .expect(res => expect(res.text).toContain(guidance))
    })

    it.each(addPages)('responds not found to %s %s', (method, path) => {
      return request(app)[method](path).expect(404)
    })
  })

  describe('when switched on, as in dev and preprod', () => {
    beforeEach(() => {
      config.prisonRegisterAddEnabled = true
      app = appWithAllRoutes({})
    })

    it('offers the "Add a new prison" button', () => {
      return request(app)
        .get('/prison-register')
        .expect(200)
        .expect(res => expect(res.text).toContain('Add a new prison'))
    })

    it('still explains that new prisons are created in NOMIS', () => {
      return request(app)
        .get('/prison-register')
        .expect(200)
        .expect(res => expect(res.text).toContain(guidance))
    })

    it('warns that a prison added here does not reach NOMIS', () => {
      return request(app)
        .get('/prison-register/add-new-prison-details')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Only add a prison here once NOMIS is no longer used.')
          expect(res.text).toContain('A prison added here is not created in NOMIS')
        })
    })

    it('starts the journey', () => {
      return request(app)
        .get('/prison-register/add')
        .expect(302)
        .expect('Location', '/prison-register/add-new-prison-details')
    })
  })
})
