import { type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class AuthErrorPage extends AbstractPage {
  private constructor(page: Page) {
    super(page, 'Authorisation Error')
  }

  static async verifyOnPage(page: Page): Promise<AuthErrorPage> {
    const errorPage = new AuthErrorPage(page)
    await errorPage.checkOnPage()
    return errorPage
  }
}
