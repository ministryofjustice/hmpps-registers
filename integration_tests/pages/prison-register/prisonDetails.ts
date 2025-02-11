import page, { Page } from '../page'

const prisonDetails = {
  prisonDetailsSection: () => cy.get('[data-qa=prison-summary-section]'),
  addressDetailsSection: (addressId: string) => cy.get(`[data-qa=address-details-section-${addressId}]`),
  amendPrisonDetailsLink: () => cy.get('[data-qa=amend-prison-details-link]'),
  prisonUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
  markAsInactiveButton: (id: string) => cy.get(`[data-qa=mark-as-inactive-${id}]`),
  markAsActiveButton: (id: string) => cy.get(`[data-qa=mark-as-active-${id}]`),
  activatedConfirmationBlock: () => cy.get(`[data-qa=confirm-prison-activation]`),
  deactivatedConfirmationBlock: () => cy.get(`[data-qa=confirm-prison-deactivation]`),
  addWelshAddressLink: (addressId: string) => cy.get(`[data-qa=add-welsh-address-link-${addressId}]`),
  addPrisonAddressLink: (prisonId: string) => cy.get(`[data-qa=add-prison-address-link-${prisonId}]`),
  deletePrisonAddressLink: (addressId: string) => cy.get(`[data-qa=delete-address-details-link-${addressId}]`),
  amendAddressDetailsLink: (addressId: string) => cy.get(`[data-qa=amend-address-details-link-${addressId}]`),
  amendWelshAddressDetailsLink: (addressId: string) =>
    cy.get(`[data-qa=amend-welsh-address-details-link-${addressId}]`),
  deleteWelshAddressDetailsLink: (addressId: string) =>
    cy.get(`[data-qa=delete-welsh-address-details-link-${addressId}]`),
}

const verifyOnPage = (prisonName: string): typeof prisonDetails & Page => page(prisonName, prisonDetails)

export default { verifyOnPage }
