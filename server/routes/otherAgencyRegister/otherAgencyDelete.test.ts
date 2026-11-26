import request from 'supertest'
import config from '../../config'
import appWithAllRoutes from '../testutils/appSetup'

describe('OtherAgency deletion feature switch', () => {
  const originalDeleteEnabled = config.agencyRegistersDeleteEnabled

  afterEach(() => {
    config.agencyRegistersDeleteEnabled = originalDeleteEnabled
  })

  it.each(['get', 'post'] as const)('returns 404 for direct %s requests when disabled', async method => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))[method]('/other-agency-register/delete?id=SHFAG').expect(404)
  })

  it.each([
    ['get', 'address/delete?id=SHFAG&addressId=1'],
    ['post', 'address/delete?id=SHFAG'],
  ] as const)('returns 404 for direct %s %s requests when disabled', async (method, path) => {
    config.agencyRegistersDeleteEnabled = false

    await request(appWithAllRoutes({}))[method](`/other-agency-register/${path}`).expect(404)
  })
})
