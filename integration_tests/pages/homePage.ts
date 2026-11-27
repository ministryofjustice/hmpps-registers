import { type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly prisonRegisterLink: Locator

  readonly courtRegisterLink: Locator

  readonly otherAgencyRegisterLink: Locator

  readonly hospitalRegisterLink: Locator

  readonly policeCustodySuiteRegisterLink: Locator

  readonly probationOfficeRegisterLink: Locator

  readonly approvedPremisesRegisterLink: Locator

  private constructor(page: Page) {
    super(page, 'HMPPS Registers')
    this.prisonRegisterLink = page.locator('[href="/prison-register"]')
    this.courtRegisterLink = page.locator('[href="/court-register"]')
    this.otherAgencyRegisterLink = page.locator('[href="/other-agency-register"]')
    this.hospitalRegisterLink = page.locator('[href="/hospital-register"]')
    this.policeCustodySuiteRegisterLink = page.locator('[href="/police-custody-suite-register"]')
    this.probationOfficeRegisterLink = page.locator('[href="/probation-office-register"]')
    this.approvedPremisesRegisterLink = page.locator('[href="/approved-premises-register"]')
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await homePage.checkOnPage()
    return homePage
  }
}
