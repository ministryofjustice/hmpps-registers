import page from '../page'
import type { Page } from '../page'
import Chainable = Cypress.Chainable

interface CourtDetailsPage {
  markAsClosedButton: () => Chainable
  markAsOpenButton: () => Chainable
  activatedConfirmationBlock: () => Chainable
  deactivatedConfirmationBlock: () => Chainable
}

const courtDetails = (courtName: string): CourtDetailsPage & Page =>
  page<CourtDetailsPage>(courtName, {
    markAsClosedButton: () => cy.get('[data-qa=mark-as-closed]'),
    markAsOpenButton: () => cy.get('[data-qa=mark-as-open]'),
    activatedConfirmationBlock: () => cy.get('[data-qa=confirm-activation]'),
    deactivatedConfirmationBlock: () => cy.get('[data-qa=confirm-deactivation]'),
  })

export default { verifyOnPage: courtDetails }
