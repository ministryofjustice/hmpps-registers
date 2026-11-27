import { test } from '@playwright/test'
import auth from '../mockApis/auth'
import manageUsersApi from '../mockApis/manageUsersApi'
import { resetStubs, signIn } from '../testUtils'
import HomePage from '../pages/homePage'
import AuthSignInPage from '../pages/authSignInPage'
import AuthErrorPage from '../pages/authErrorPage'

test.describe('Sign in', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Unauthenticated user is directed to HMPPS Auth', async ({ page }) => {
    await Promise.all([auth.stubSignIn(), manageUsersApi.stubManageUser()])

    await page.goto('/')

    await AuthSignInPage.verifyOnPage(page)
  })

  test('User is shown the home page after signing in', async ({ page }) => {
    await signIn(page)

    await HomePage.verifyOnPage(page)
  })

  test('User can sign out', async ({ page }) => {
    await signIn(page)
    const homePage = await HomePage.verifyOnPage(page)

    await homePage.signOut()

    await AuthSignInPage.verifyOnPage(page)
  })

  test.describe('Role based access', () => {
    test('User without the registers role is shown the not authorised page', async ({ page }) => {
      await signIn(page, { roles: ['ROLE_HMPPS_BANANAS'] })

      await AuthErrorPage.verifyOnPage(page)
    })

    test('User with the registers role is shown the home page', async ({ page }) => {
      await signIn(page, { roles: ['ROLE_HMPPS_REGISTERS_MAINTAINER'] })

      await HomePage.verifyOnPage(page)
    })
  })
})
