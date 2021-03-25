import type { Page } from '../page'
import page from '../page'

const courtDetails = {
  continueButton: () => cy.contains('Continue'),
  telephoneNumber: () => cy.get('#telephonenumber'),
  faxNumber: () => cy.get('#faxnumber'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (): typeof courtDetails & Page => page('Add a new court - contact details', courtDetails)

export default { verifyOnPage }
