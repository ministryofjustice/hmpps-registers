import type { Page } from '../page'
import page from '../page'

const courtBuilding = {
  saveButton: () => cy.contains('Save'),
  buildingName: () => cy.get('#buildingname'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  addressTown: () => cy.get('#addresstown'),
  addressCounty: () => cy.get('#addresscounty'),
  addressPostcode: () => cy.get('#addresspostcode'),
  addressCountry: () => cy.get('#addresscountry'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (buildingName: string): typeof courtBuilding & Page =>
  page(`Amend court - building details - ${buildingName}`, courtBuilding)
export default { verifyOnPage }
