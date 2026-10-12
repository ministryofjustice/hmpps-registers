import page, { Page } from '../../page'

const addAgencyPhone = {
  caption: () => cy.get('.govuk-caption-l'),
  phoneNumber: () => cy.get('#phoneNumber'),
  phoneNumberError: () => cy.get('#phoneNumber-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof addAgencyPhone & Page =>
  page(`Add phone number for ${agencyName}`, addAgencyPhone)

export default { verifyOnPage }
