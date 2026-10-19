import page, { Page } from '../../page'

const updateAgencyGeographicalArea = {
  geographicalArea: () => cy.get('input#geographicalArea'),
  code: () => cy.get('#geographicalAreaCode'),
  suggestions: () => cy.get('#geographicalArea__listbox .autocomplete__option'),
  error: () => cy.get('#geographicalArea-error'),
  searchStatus: () => cy.get('#geographicalArea-search-status'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyGeographicalArea & Page =>
  page(`Update geographical area for ${agencyName}`, updateAgencyGeographicalArea)

export default { verifyOnPage }
