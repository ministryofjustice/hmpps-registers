import type { Page } from '../page'
import page from '../page'

const prisonDetails = {
  continueButton: () => cy.contains('Continue'),
  id: () => cy.get('#id'),
  name: () => cy.get('#name'),
  prisonType: (prisonType: string) => cy.get(`input[value="${prisonType}"]`),
  gender: (gender: string) => cy.get(`input[value="${gender}"]`),
  contractedRadioYes: () => cy.get('#contracted[value="yes"]'),
  lthseYes: () => cy.get('#lthse[value="yes"]'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (): typeof prisonDetails & Page => page('Add a new prison - main details', prisonDetails)

export default { verifyOnPage }
