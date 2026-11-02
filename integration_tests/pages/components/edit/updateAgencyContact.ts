import page, { Page } from '../../page'

const updateAgencyContact = {
  contact: () => cy.get('#contact'),
  error: () => cy.get('#contact-error'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyContact & Page =>
  page(`Update contact for ${agencyName}`, updateAgencyContact)

export default { verifyOnPage }
