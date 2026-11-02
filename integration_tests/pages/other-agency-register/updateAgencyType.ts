import page, { Page } from '../page'

const updateAgencyType = {
  option: (value: string) => cy.get(`input[name=agencyType][value=${value}]`),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyType & Page =>
  page(`Update agency type for ${agencyName}`, updateAgencyType)

export default { verifyOnPage }
