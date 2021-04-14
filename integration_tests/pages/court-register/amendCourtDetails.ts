import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  saveButton: () => cy.contains('Save'),
  id: () => cy.get('#id'),
  type: () => cy.get('#type'),
  name: () => cy.get('#name'),
  description: () => cy.get('#description'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (courtId: string): typeof courtDetails & Page =>
  page(`Amend court - main details for ${courtId}`, courtDetails)

export default { verifyOnPage }
