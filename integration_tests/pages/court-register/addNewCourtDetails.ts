import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  continueButton: () => cy.contains('Continue'),
  id: () => cy.get('#id'),
  type: () => cy.get('#type'),
  name: () => cy.get('#name'),
  description: () => cy.get('#description'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (): typeof courtDetails & Page => page('Add a new court - main details', courtDetails)

export default { verifyOnPage }
