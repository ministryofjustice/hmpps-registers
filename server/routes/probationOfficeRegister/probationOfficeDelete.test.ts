import request from 'supertest'
import config from '../../config'
import appWithAllRoutes from '../testutils/appSetup'

describe('ProbationOffice deletion feature switch', () => {
  const originalDeleteEnabled = config.agencyRegistersDeleteEnabled

  afterEach(() => {
    config.agencyRegistersDeleteEnabled = originalDeleteEnabled
  })

  it.each(['get', 'post'] as const)('returns 404 for direct %s requests when disabled', async method => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))[method]('/probation-office-register/delete?id=SHFPO').expect(404)
  })

  it.each([
    ['get', 'address/delete?id=SHFPO&addressId=1'],
    ['post', 'address/delete?id=SHFPO'],
  ] as const)('returns 404 for direct %s %s requests when disabled', async (method, path) => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))[method](`/probation-office-register/${path}`).expect(404)
  })
})
