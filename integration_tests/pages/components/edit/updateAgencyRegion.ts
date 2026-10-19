import page, { Page } from '../../page'

const updateAgencyRegion = {
  region: () => cy.get('input#region'),
  code: () => cy.get('#regionCode'),
  suggestions: () => cy.get('#region__listbox .autocomplete__option'),
  error: () => cy.get('#region-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyRegion & Page =>
  page(`Update region for ${agencyName}`, updateAgencyRegion)

export default { verifyOnPage }
