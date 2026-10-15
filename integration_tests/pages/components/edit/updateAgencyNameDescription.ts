import page, { Page } from '../../page'

const updateAgencyNameDescription = {
  caption: () => cy.get('.govuk-caption-l'),
  name: () => cy.get('#name'),
  nameError: () => cy.get('#name-error'),
  description: () => cy.get('#description'),
  descriptionError: () => cy.get('#description-error'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyNameDescription & Page =>
  page(`Update name and description for ${agencyName}`, updateAgencyNameDescription)

export default { verifyOnPage }
