import type { Page } from '../page'
import page from '../page'

const prisonAddress = {
  continueButton: () => cy.contains('Continue'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  addressTown: () => cy.get('#addresstown'),
  addressCounty: () => cy.get('#addresscounty'),
  addressPostcode: () => cy.get('#addresspostcode'),
  addressCountry: () => cy.get('#addresscountry'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (): typeof prisonAddress & Page => page('Add a new prison - address details', prisonAddress)

export default { verifyOnPage }
