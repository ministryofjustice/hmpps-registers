import page, { Page } from '../../page'

const updateAgencyPhone = {
  caption: () => cy.get('.govuk-caption-l'),
  phoneNumber: () => cy.get('#phoneNumber'),
  phoneNumberError: () => cy.get('#phoneNumber-error'),
  phoneId: () => cy.get('input[name=phoneId]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyPhone & Page =>
  page(`Update phone number for ${agencyName}`, updateAgencyPhone)

export default { verifyOnPage }
