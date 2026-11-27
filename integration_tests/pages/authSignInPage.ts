import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

/** The stubbed HMPPS Auth sign-in page */
export default class AuthSignInPage extends AbstractPage {
  private constructor(page: Page) {
    super(page, 'Sign in')
  }

  static async verifyOnPage(page: Page): Promise<AuthSignInPage> {
    const signInPage = new AuthSignInPage(page)
    await signInPage.checkOnPage()
    return signInPage
  }
}
