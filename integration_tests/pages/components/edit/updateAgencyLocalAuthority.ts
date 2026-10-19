import page, { Page } from '../../page'

const updateAgencyLocalAuthority = {
  localAuthority: () => cy.get('input#localAuthority'),
  code: () => cy.get('#localAuthorityCode'),
  suggestions: () => cy.get('#localAuthority__listbox .autocomplete__option'),
  error: () => cy.get('#localAuthority-error'),
  searchStatus: () => cy.get('#localAuthority-search-status'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyLocalAuthority & Page =>
  page(`Update local authority for ${agencyName}`, updateAgencyLocalAuthority)

export default { verifyOnPage }
