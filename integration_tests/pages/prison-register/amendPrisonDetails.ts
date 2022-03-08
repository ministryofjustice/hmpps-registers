import type { Page } from '../page'
import page from '../page'

const prisonDetails = {
  saveButton: () => cy.contains('Save'),
  id: () => cy.get('#id'),
  name: () => cy.get('#name'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (prisonId: string): typeof prisonDetails & Page =>
  page(`Amend prison - main details for ${prisonId}`, prisonDetails)

export default { verifyOnPage }
