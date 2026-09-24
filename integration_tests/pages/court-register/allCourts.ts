import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('courts', rowNumber).find('td').eq(columnNumber)

const allCourts = {
  courts: (rowNumber: number) => ({
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
  crownCourtFilter: () => cy.get('input[value="CC"]'),
  magistratesFilter: () => cy.get('input[value="MC"]'),
  cancelCrownCourtFilter: () => cy.get('.moj-filter-tags').contains('CC'),
  cancelActiveFilter: () => cy.get('.moj-filter-tags').contains('Active'),
  cancelTextSearchFilter: (value: string) => cy.get('.moj-filter-tags').contains(value),
}

const verifyOnPage = (): typeof allCourts & Page => page('Court Register', allCourts)

export default { verifyOnPage }
