import page, { Page } from '../page'
import Chainable = Cypress.Chainable

interface CourtDetailsPage extends Page {
  markAsClosedButton: () => Chainable<Element>
  markAsOpenButton: () => Chainable<Element>
  activatedConfirmationBlock: () => Chainable<Element>
  deactivatedConfirmationBlock: () => Chainable<Element>
}

const courtDetails = (courtName: string): CourtDetailsPage =>
  page(courtName, {
    markAsClosedButton: () => cy.get('[data-qa=mark-as-closed]'),
    markAsOpenButton: () => cy.get('[data-qa=mark-as-open]'),
    activatedConfirmationBlock: () => cy.get('[data-qa=confirm-activation]'),
    deactivatedConfirmationBlock: () => cy.get('[data-qa=confirm-deactivation]'),
  }) as CourtDetailsPage

export default { verifyOnPage: courtDetails }
