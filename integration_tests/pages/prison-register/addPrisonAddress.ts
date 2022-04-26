import type { Page } from '../page'
import page from '../page'

const prisonAddress = {
  saveButton: () => cy.contains('Save'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  addressTown: () => cy.get('#addresstown'),
  addressCounty: () => cy.get('#addresscounty'),
  addressPostcode: () => cy.get('#addresspostcode'),
  addressCountry: () => cy.get('#addresscountry'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (prisonId: string): typeof prisonAddress & Page =>
  page(`Add prison address for ${prisonId}`, prisonAddress)
export default { verifyOnPage }
