import page, { Page } from '../../page'

const updateAgencyPayrollRegion = {
  payrollRegion: () => cy.get('input#payrollRegion'),
  code: () => cy.get('#payrollRegionCode'),
  suggestions: () => cy.get('#payrollRegion__listbox .autocomplete__option'),
  error: () => cy.get('#payrollRegion-error'),
  searchStatus: () => cy.get('#payrollRegion-search-status'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof updateAgencyPayrollRegion & Page =>
  page(`Update payroll region for ${agencyName}`, updateAgencyPayrollRegion)

export default { verifyOnPage }
