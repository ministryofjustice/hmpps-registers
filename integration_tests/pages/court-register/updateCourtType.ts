import page, { Page } from '../page'

const updateCourtType = {
  caption: () => cy.get('.govuk-caption-l'),
  courtTypes: () => cy.get('input[name=courtType]'),
  courtType: (code: string) => cy.get(`input[name=courtType][value="${code}"]`),
  courtTypeLabel: (code: string) => cy.get(`input[name=courtType][value="${code}"]`).next('label'),
  courtTypeError: () => cy.get('#courtType-error'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (courtName: string): typeof updateCourtType & Page =>
  page(`Update court type for ${courtName}`, updateCourtType)

export default { verifyOnPage }
