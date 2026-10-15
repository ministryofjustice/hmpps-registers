import page, { Page } from '../../page'

const updateAgencyCjitCode = {
  cjitCode: () => cy.get('#cjitCode'),
  error: () => cy.get('#cjitCode-error'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyCjitCode & Page =>
  page(`Update CJIT code for ${agencyName}`, updateAgencyCjitCode)

export default { verifyOnPage }
