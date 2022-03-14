import page, { Page } from '../page'

const prisonDetails = {
  prisonDetailsSection: () => cy.get('[data-qa=prison-summary-section]'),
  addressDetailsSection: (addressId: string) => cy.get(`[data-qa=address-details-section-${addressId}]`),
  amendPrisonDetailsLink: () => cy.get('[data-qa=amend-prison-details-link]'),
  prisonUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
  amendAddressDetailsLink: (addressId: string) => cy.get(`[data-qa=amend-address-details-link-${addressId}]`),
}

const verifyOnPage = (prisonName: string): typeof prisonDetails & Page => page(prisonName, prisonDetails)

export default { verifyOnPage }
