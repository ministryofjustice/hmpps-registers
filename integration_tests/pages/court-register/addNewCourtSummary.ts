import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  saveButton: () => cy.contains('Save and continue'),
  courtDetails: () => cy.get('.court-details'),
  buildingDetails: () => cy.get('.building-details'),
  contactDetails: () => cy.get('.contact-details'),
  changeCourtDetailsLink: () => cy.get('[data-qa=change-court-details-link]'),
  changeBuildingDetailsLink: () => cy.get('[data-qa=change-building-details-link]'),
  changeContactDetailsLink: () => cy.get('[data-qa=change-contact-details-link]'),
}
const verifyOnPage = (): typeof courtDetails & Page => page('Add a new court - check details', courtDetails)

export default { verifyOnPage }
