import type { Page } from '../page'
import page from '../page'

const welshPrisonAddress = {
  saveButton: () => cy.contains('Save'),
  addressLine1: () => cy.get('#addressline1inwelsh'),
  addressLine2: () => cy.get('#addressline2inwelsh'),
  addressTown: () => cy.get('#addresstowninwelsh'),
  addressCounty: () => cy.get('#addresscountyinwelsh'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (prisonId: string): typeof welshPrisonAddress & Page =>
  page(`Amend Welsh address details for ${prisonId}`, welshPrisonAddress)
export default { verifyOnPage }
