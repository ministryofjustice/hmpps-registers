import page, { Page } from '../../page'

const updateAgencyEmail = {
  caption: () => cy.get('.govuk-caption-l'),
  emailAddress: () => cy.get('#emailAddress'),
  emailAddressError: () => cy.get('#emailAddress-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyEmail & Page =>
  page(`Update email address for ${agencyName}`, updateAgencyEmail)

export default { verifyOnPage }
