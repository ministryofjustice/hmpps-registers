import type { Page } from '../page'
import page from '../page'

const courtBuilding = {
  continueButton: () => cy.contains('Continue'),
  buildingName: () => cy.get('#buildingname'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  addressTown: () => cy.get('#addresstown'),
  addressCounty: () => cy.get('#addresscounty'),
  addressPostcode: () => cy.get('#addresspostcode'),
  addressCountry: () => cy.get('#addresscountry'),
}
const verifyOnPage = (): typeof courtBuilding & Page => page('Add a new court - building details', courtBuilding)

export default { verifyOnPage }
