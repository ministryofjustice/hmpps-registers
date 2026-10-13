import page, { Page } from '../../page'

const deleteAgencyPhone = {
  caption: () => cy.get('.govuk-caption-l'),
  phoneNumber: () => cy.get('[data-qa=phone-details-section] .phone-details'),
  phoneId: () => cy.get('input[name=phoneId]'),
  deleteButton: () => cy.get('.govuk-button--warning'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof deleteAgencyPhone & Page =>
  page(`Delete phone number for ${agencyName}`, deleteAgencyPhone)

export default { verifyOnPage }
