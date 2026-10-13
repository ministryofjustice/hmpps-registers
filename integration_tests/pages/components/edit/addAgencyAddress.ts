import page, { Page } from '../../page'

const addAgencyAddress = {
  caption: () => cy.get('.govuk-caption-l'),
  addressLine1: () => cy.get('#addressline1'),
  addressLine2: () => cy.get('#addressline2'),
  town: () => cy.get('#addresstown'),
  county: () => cy.get('#addresscounty'),
  postcode: () => cy.get('#addresspostcode'),
  country: (value: string) => cy.get(`input[name=addresscountry][value="${value}"]`),
  error: (field: string) => cy.get(`#${field}-error`),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof addAgencyAddress & Page =>
  page(`Add address for ${agencyName}`, addAgencyAddress)

export default { verifyOnPage }
