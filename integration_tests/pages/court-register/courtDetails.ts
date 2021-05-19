import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  markAsClosedButton: (id: string) => cy.get(`[data-qa=mark-as-closed-${id}]`),
  markAsOpenButton: (id: string) => cy.get(`[data-qa=mark-as-open-${id}]`),
  activatedConfirmationBlock: (type: 'court' | 'building') => cy.get(`[data-qa=confirm-${type}-activation]`),
  deactivatedConfirmationBlock: (type: 'court' | 'building') => cy.get(`[data-qa=confirm-${type}-deactivation]`),
  courtUpdatedConfirmationBlock: () => cy.get('[data-qa=confirm-updated]'),
  courtDetailsSection: () => cy.get('[data-qa=court-summary-section]'),
  amendCourtDetailsLink: () => cy.get('[data-qa=amend-court-details-link]'),
  buildingDetailsSection: (buildingId: string) => cy.get(`[data-qa=building-summary-section-${buildingId}]`),
  amendBuildingDetailsLink: (buildingId: string) => cy.get(`[data-qa=amend-building-details-link-${buildingId}]`),
  amendBuildingContactsLink: (buildingId: string) =>
    cy.get(`[data-qa=building-summary-section-${buildingId}] [data-qa=change-contact-details-link]`),
  addBuildingLink: () => cy.get(`[data-qa=add-court-building-link]`),
  backLink: () => cy.contains('Back'),
}
const verifyOnPage = (courtName: string): typeof courtDetails & Page => page(courtName, courtDetails)

export default { verifyOnPage }
