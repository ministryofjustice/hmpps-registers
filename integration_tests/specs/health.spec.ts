import { expect, test } from '@playwright/test'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import manageUsersApi from '../mockApis/manageUsersApi'
import hmppsAgencyRegisterApi from '../mockApis/hmppsAgencyRegisterApi'
import componentsApi from '../mockApis/components'
import { resetStubs } from '../testUtils'

test.describe('Health', () => {
  test.beforeEach(async () => {
    await Promise.all([
      auth.stubPing(),
      tokenVerification.stubTokenVerificationPing(),
      manageUsersApi.stubManageUsersPing(),
      hmppsAgencyRegisterApi.stubPing(),
      componentsApi.stubComponentsPing(),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('Health check is accessible and status is UP', async ({ page }) => {
    const response = await page.request.get('/health')
    const payload = await response.json()
    expect(payload.status).toBe('UP')
  })

  test('Ping is accessible and status is UP', async ({ page }) => {
    const response = await page.request.get('/ping')
    const payload = await response.json()
    expect(payload.status).toBe('UP')
  })
})
