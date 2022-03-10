import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('prisons', rowNumber).find('td').eq(columnNumber)

const allPrisons = {
  prisons: (rowNumber: number) => ({
    id: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    active: () => column(rowNumber, 2),
    types: () => column(rowNumber, 3),
  }),
  viewPrisonLink: (prisonId: string) => cy.get(`[href="/prison-register/details?id=${prisonId}"]`).first(),
  mojFilter: () => cy.get('div.moj-filter'),
  showFilterButton: () => cy.contains('Show filter'),
  hideFilterButton: () => cy.contains('Hide filter'),
  applyFilterButton: () => cy.contains('Apply filters'),
  allFilter: () => cy.contains('label', 'All').prev(),
  openFilter: () => cy.contains('label', 'Open').prev(),
  closedFilter: () => cy.contains('label', 'Closed').prev(),
  textSearchFilter: () => cy.get('#textSearch'),
  maleFilter: () => cy.get('input[value="MALE"]'),
  femaleFilter: () => cy.get('input[value="FEMALE"]'),
  hmpFilter: () => cy.get('input[value="HMP"]'),
  yoiFilter: () => cy.get('input[value="YOI"]'),
  cancelOpenFilter: () => cy.get('.moj-filter-tags').contains('Open'),
  cancelTextSearchFilter: (value: string) => cy.get('.moj-filter-tags').contains(value),
  cancelFemaleFilter: () => cy.get('.moj-filter-tags').contains('Female'),
  cancelHmpFilter: () => cy.get('.moj-filter-tags').contains('HMP'),
}

const verifyOnPage = (): typeof allPrisons & Page => page('Prison Register', allPrisons)

export default { verifyOnPage }
