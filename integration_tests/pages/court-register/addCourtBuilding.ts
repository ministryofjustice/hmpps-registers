import type { Page } from '../page'
import page from '../page'

const courtBuilding = {
  saveButton: () => cy.contains('Save'),
  buildingName: () => cy.get('#buildingname'),
  subCode: () => cy.get('#subCode'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  addressTown: () => cy.get('#addresstown'),
  addressCounty: () => cy.get('#addresscounty'),
  addressPostcode: () => cy.get('#addresspostcode'),
  addressCountry: () => cy.get('#addresscountry'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (): typeof courtBuilding & Page => page('Amend court - new building details', courtBuilding)

export default { verifyOnPage }
