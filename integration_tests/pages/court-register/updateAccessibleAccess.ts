import page, { Page } from '../page'

const updateAccessibleAccess = {
  caption: () => cy.get('.govuk-caption-l'),
  options: () => cy.get('input[name=accessibleAccess]'),
  option: (value: string) => cy.get(`input[name=accessibleAccess][value="${value}"]`),
  optionLabel: (value: string) => cy.get(`input[name=accessibleAccess][value="${value}"]`).next('label'),
  error: () => cy.get('#accessibleAccess-error'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (courtName: string): typeof updateAccessibleAccess & Page =>
  page(`Update accessible access for ${courtName}`, updateAccessibleAccess)

export default { verifyOnPage }
