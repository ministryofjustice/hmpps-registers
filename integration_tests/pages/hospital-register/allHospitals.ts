import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('hospitals', rowNumber).find('td').eq(columnNumber)

const allHospitals = {
  hospitals: (rowNumber: number) => ({
    id: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    active: () => column(rowNumber, 2),
    highSecurity: () => column(rowNumber, 3),
  }),
  mojFilter: () => cy.get('div.moj-filter'),
  showFilterButton: () => cy.contains('Show filter'),
  hideFilterButton: () => cy.contains('Hide filter'),
  applyFilterButton: () => cy.contains('Apply filters'),
  allFilter: () => cy.get('#active'),
  activeFilter: () => cy.get('#active-2'),
  inactiveFilter: () => cy.get('#active-3'),
  highSecurityAllFilter: () => cy.get('#highSecurity'),
  highSecurityYesFilter: () => cy.get('#highSecurity-2'),
  highSecurityNoFilter: () => cy.get('#highSecurity-3'),
  textSearchFilter: () => cy.get('#textSearch'),
  cancelActiveFilter: () => cy.get('.moj-filter-tags').contains('Active'),
  cancelHighSecurityFilter: () => cy.get('.moj-filter-tags').contains('High security'),
  cancelNotHighSecurityFilter: () => cy.get('.moj-filter-tags').contains('Not high security'),
  cancelTextSearchFilter: (value: string) => cy.get('.moj-filter-tags').contains(value),
  viewHospitalLink: (hospitalId: string) => cy.get(`[href="/hospital-register/details?id=${hospitalId}"]`).first(),
}

const verifyOnPage = (): typeof allHospitals & Page => page('Hospital Register', allHospitals)

export default { verifyOnPage }
