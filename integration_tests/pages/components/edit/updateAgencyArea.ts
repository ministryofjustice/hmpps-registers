import page, { Page } from '../../page'

const updateAgencyArea = {
  area: () => cy.get('input#area-name'),
  suggestions: () => cy.get('#area-name__listbox .autocomplete__option'),
  error: () => cy.get('#area-name-error'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyArea & Page =>
  page(`Update area for ${agencyName}`, updateAgencyArea)

export default { verifyOnPage }
