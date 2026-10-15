import page, { Page } from '../../page'

const updateAgencyActive = {
  active: () => cy.get('input[name=active][value=true]'),
  inactive: () => cy.get('input[name=active][value=false]'),
  date: () => cy.get('#inactiveDate'),
  day: () => cy.get('input[name=inactiveDay]'),
  month: () => cy.get('input[name=inactiveMonth]'),
  year: () => cy.get('input[name=inactiveYear]'),
  dateError: () => cy.get('#inactiveDate-error'),
  statusError: () => cy.get('#active-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyActive & Page =>
  page(`Update active status for ${agencyName}`, updateAgencyActive)

export default { verifyOnPage }
