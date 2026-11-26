import page, { Page } from '../../page'

const updateAgencyAccessibleAccess = {
  option: (value: string) => cy.get(`input[name=accessibleAccess][value=${value}]`),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyAccessibleAccess & Page =>
  page(`Update accessible access for ${agencyName}`, updateAgencyAccessibleAccess)

export default { verifyOnPage }
