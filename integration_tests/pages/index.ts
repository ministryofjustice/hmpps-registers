import page, { Page } from './page'
import Chainable = Cypress.Chainable

interface IndexPage extends Page {
  headerUserName: () => Chainable<Element>
  courtRegisterLink: () => Chainable<Element>
}

const indexPage = (): IndexPage =>
  page('HMPPS Registers', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    courtRegisterLink: () => cy.get('[href="/court-register"]'),
  }) as IndexPage

export default { verifyOnPage: indexPage }
