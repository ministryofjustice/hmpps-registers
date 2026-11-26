import page, { Page } from '../page'

const departmentContactDetails = {
  departmentType: (type: string) => cy.get(`input[name=departmentType][value=${type}]`),
  emailAddress: () => cy.get('[data-qa=emailAddress]'),
  webAddress: () => cy.get('[data-qa=webAddress]'),
  phoneNumber: () => cy.get('[data-qa=phoneNumber]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
  error: () => cy.get('.govuk-error-message'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}

const verifyOnPage = (title: string): typeof departmentContactDetails & Page => page(title, departmentContactDetails)

export default { verifyOnPage }
