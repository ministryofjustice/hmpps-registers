import type { Page } from '../page'
import page from '../page'

const prisonAddress = {
  saveButton: () => cy.contains('Save'),
  addressLine1InWelsh: () => cy.get('#addressline1inwelsh'),
  addressLine2InWelsh: () => cy.get('#addressline2inwelsh'),
  townInWelsh: () => cy.get('#towninwelsh'),
  countyInWelsh: () => cy.get('#countyinwelsh'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (prisonId: string): typeof prisonAddress & Page =>
  page(`Add Welsh prison address for ${prisonId}`, prisonAddress)
export default { verifyOnPage }
