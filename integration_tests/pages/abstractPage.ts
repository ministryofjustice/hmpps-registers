import { expect, type Locator, type Page } from '@playwright/test'

export default abstract class AbstractPage {
  readonly page: Page

  /** the page heading */
  readonly heading: Locator

  /** user name that appears in the header */
  readonly usersName: Locator

  /** link to sign out */
  readonly signOutLink: Locator

  protected constructor(page: Page, title: string) {
    this.page = page
    this.heading = page.locator('h1', { hasText: title })
    this.usersName = page.getByTestId('header-user-name')
    this.signOutLink = page.getByTestId('signOut')
  }

  async checkOnPage(): Promise<void> {
    await expect(this.heading).toBeVisible()
  }

  async signOut(): Promise<void> {
    await this.signOutLink.click()
  }
}
