import type { Page } from '../page'
import page from '../page'

const prisonDetails = {
  saveButton: () => cy.contains('Save and continue'),
  prisonDetails: () => cy.get('.prison-details'),
  addressDetails: () => cy.get('.address-details'),
  changePrisonDetailsLink: () => cy.get('[data-qa=change-prison-details-link]'),
  changeAddressDetailsLink: () => cy.get('[data-qa=change-address-details-link]'),
}
const verifyOnPage = (): typeof prisonDetails & Page => page('Add a new prison - check details', prisonDetails)

export default { verifyOnPage }
