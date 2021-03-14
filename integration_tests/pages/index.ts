import page from './page'
import type { Page } from './page'
import Chainable = Cypress.Chainable

interface IndexPage {
  headerUserName: () => Chainable
  courtRegisterLink: () => Chainable
}

const indexPage = (): Page & IndexPage =>
  page<IndexPage>('HMPPS Registers', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    courtRegisterLink: () => cy.get('[href="/court-register"]'),
  })

export default { verifyOnPage: indexPage }
