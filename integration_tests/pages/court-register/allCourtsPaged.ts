import page from '../page'
import type { Page } from '../page'
import pagination from '../sections/pagination'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('courts', rowNumber).find('td').eq(columnNumber)

const allCourtsPaged = {
  courts: (rowNumber: number) => ({
    code: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    type: () => column(rowNumber, 2),
    status: () => column(rowNumber, 3),
  }),
  viewCourtLink: (courtId: string) => cy.get(`[href="/court-register/details?id=${courtId}"]`).first(),
  addNewCourtButton: () => cy.contains('Add a new court'),
  ...pagination,
  mojFilter: () => cy.get('div.moj-filter'),
  showFilterButton: () => cy.contains('Show filter'),
  hideFilterButton: () => cy.contains('Hide filter'),
  applyFilterButton: () => cy.contains('Apply filters'),
  allFilter: () => cy.contains('label', 'All').prev(),
  openFilter: () => cy.contains('label', 'Open').prev(),
  closedFilter: () => cy.contains('label', 'Closed').prev(),
  crownFilter: () => cy.get('input[value="CRN"]'),
  countyFilter: () => cy.get('input[value="COU"]'),
  page2Link: () => cy.get('.moj-pagination__link').get('a').contains('2'),
  nextPageLink: () => cy.get('.moj-pagination__link').contains('Next'),
  cancelOpenFilter: () => cy.get('.moj-filter-tags').contains('Open'),
  cancelCrownFilter: () => cy.get('.moj-filter-tags').contains('Crown'),
  cancelCountyFilter: () => cy.get('.moj-filter-tags').contains('County'),
}

const verifyOnPage = (): typeof allCourtsPaged & Page => page('Court Register', allCourtsPaged)

export default { verifyOnPage }
