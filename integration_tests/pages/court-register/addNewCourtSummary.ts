import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  saveButton: () => cy.contains('Save and continue'),
  courtDetails: () => cy.get('.court-details'),
  buildingDetails: () => cy.get('.building-details'),
  contactDetails: () => cy.get('.contact-details'),
}
const verifyOnPage = (): typeof courtDetails & Page => page('Add a new court - check details', courtDetails)

export default { verifyOnPage }
