import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) =>
  row('approved-premises', rowNumber).find('td').eq(columnNumber)

const allApprovedPremises = {
  approvedPremisesList: (rowNumber: number) => ({
    id: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    active: () => column(rowNumber, 2),
  }),
  tableHeaders: () => cy.get('[data-qa=approved-premises] thead th'),
  noApprovedPremises: () => cy.get('[data-qa=no-approved-premises]'),
  mojFilter: () => cy.get('div.moj-filter'),
  showFilterButton: () => cy.contains('Show filter'),
  hideFilterButton: () => cy.contains('Hide filter'),
  applyFilterButton: () => cy.contains('Apply filters'),
  allFilter: () => cy.get('#active'),
  activeFilter: () => cy.get('#active-2'),
  inactiveFilter: () => cy.get('#active-3'),
  textSearchFilter: () => cy.get('#textSearch'),
  cancelActiveFilter: () => cy.get('.moj-filter-tags').contains('Active'),
  cancelTextSearchFilter: (value: string) => cy.get('.moj-filter-tags').contains(value),
  viewApprovedPremisesLink: (approvedPremisesId: string) =>
    cy.get(`[href="/approved-premises-register/details?id=${approvedPremisesId}"]`).first(),
}

const verifyOnPage = (): typeof allApprovedPremises & Page => page('Approved Premises Register', allApprovedPremises)

export default { verifyOnPage }
