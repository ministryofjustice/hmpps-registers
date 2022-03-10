import page, { Page } from '../page'

const prisonDetails = {
  prisonDetailsSection: () => cy.get('[data-qa=prison-summary-section]'),
  addressDetailsSection: () => cy.get('[data-qa=address-details-section]'),
  amendPrisonDetailsLink: () => cy.get('[data-qa=amend-prison-details-link]'),
  prisonUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
}

const verifyOnPage = (prisonName: string): typeof prisonDetails & Page => page(prisonName, prisonDetails)

export default { verifyOnPage }
