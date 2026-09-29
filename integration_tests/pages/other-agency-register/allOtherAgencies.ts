import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('other-agencies', rowNumber).find('td').eq(columnNumber)

const allOtherAgencies = {
  otherAgencies: (rowNumber: number) => ({
    id: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    active: () => column(rowNumber, 2),
    type: () => column(rowNumber, 3),
  }),
  mojFilter: () => cy.get('div.moj-filter'),
  showFilterButton: () => cy.contains('Show filter'),
  hideFilterButton: () => cy.contains('Hide filter'),
  applyFilterButton: () => cy.contains('Apply filters'),
  allFilter: () => cy.contains('label', 'All').prev(),
  activeFilter: () => cy.contains('label', 'Active').prev(),
  inactiveFilter: () => cy.contains('label', 'Inactive').prev(),
  textSearchFilter: () => cy.get('#textSearch'),
  pecsFilter: () => cy.get('input[value="PECS"]'),
  airportFilter: () => cy.get('input[value="AIRPORT"]'),
  cancelPecsFilter: () => cy.get('.moj-filter-tags').contains('PECS'),
  cancelActiveFilter: () => cy.get('.moj-filter-tags').contains('Active'),
  cancelTextSearchFilter: (value: string) => cy.get('.moj-filter-tags').contains(value),
  viewOtherAgencyLink: (agencyId: string) => cy.get(`[href="/other-agency-register/details?id=${agencyId}"]`).first(),
}

const verifyOnPage = (): typeof allOtherAgencies & Page => page('Other Agency Register', allOtherAgencies)

export default { verifyOnPage }
