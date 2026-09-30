import page, { Page } from '../../page'

const addAgencyEmail = {
  caption: () => cy.get('.govuk-caption-l'),
  emailAddress: () => cy.get('#emailAddress'),
  emailAddressError: () => cy.get('#emailAddress-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof addAgencyEmail & Page =>
  page(`Add email address for ${agencyName}`, addAgencyEmail)

export default { verifyOnPage }
