import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  markAsClosedButton: () => cy.get('[data-qa=mark-as-closed]'),
  markAsOpenButton: () => cy.get('[data-qa=mark-as-open]'),
  activatedConfirmationBlock: () => cy.get('[data-qa=confirm-activation]'),
  deactivatedConfirmationBlock: () => cy.get('[data-qa=confirm-deactivation]'),
  courtUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
  courtDetailsSection: () => cy.get('[data-qa=court-summary-section]'),
  amendCourtDetailsLink: () => cy.get('[data-qa=amend-court-details-link]'),
  buildingDetailsSection: (buildingId: string) => cy.get(`[data-qa=building-summary-section-${buildingId}]`),
  amendBuildingDetailsLink: (buildingId: string) => cy.get(`[data-qa=amend-building-details-link-${buildingId}]`),
  amendBuildingContactsLink: (buildingId: string) =>
    cy.get(`[data-qa=building-summary-section-${buildingId}] [data-qa=change-contact-details-link]`),
  addBuildingLink: () => cy.get(`[data-qa=add-court-building-link]`),
}
const verifyOnPage = (courtName: string): typeof courtDetails & Page => page(courtName, courtDetails)

export default { verifyOnPage }
