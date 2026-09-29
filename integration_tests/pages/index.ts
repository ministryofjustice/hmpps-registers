import page from './page'
import type { Page } from './page'

const index = {
  headerUserName: () => cy.get('[data-qa=header-user-name]'),
  prisonRegisterLink: () => cy.get('[href="/prison-register"]'),
  courtRegisterLink: () => cy.get('[href="/court-register"]'),
  otherAgencyRegisterLink: () => cy.get('[href="/other-agency-register"]'),
  hospitalRegisterLink: () => cy.get('[href="/hospital-register"]'),
  policeCustodySuiteRegisterLink: () => cy.get('[href="/police-custody-suite-register"]'),
  probationOfficeRegisterLink: () => cy.get('[href="/probation-office-register"]'),
}

const verifyOnPage = (): Page & typeof index => page('HMPPS Registers', index)

export default { verifyOnPage }
