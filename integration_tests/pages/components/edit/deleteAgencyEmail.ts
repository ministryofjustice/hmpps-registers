import page, { Page } from '../../page'

const deleteAgencyEmail = {
  caption: () => cy.get('.govuk-caption-l'),
  emailAddress: () => cy.get('[data-qa=email-details-section] .address-details'),
  deleteButton: () => cy.get('.govuk-button--warning'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (courtName: string): typeof deleteAgencyEmail & Page =>
  page(`Delete email address for ${courtName}`, deleteAgencyEmail)

export default { verifyOnPage }
