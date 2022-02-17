import page, { Page } from '../page'

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('prisons', rowNumber).find('td').eq(columnNumber)

const allPrisons = {
  prisons: (rowNumber: number) => ({
    id: () => column(rowNumber, 0),
    name: () => column(rowNumber, 1),
    active: () => column(rowNumber, 2),
  }),
  viewPrisonLink: (prisonId: string) => cy.get(`[href="/prison-register/details?id=${prisonId}"]`).first(),
}

const verifyOnPage = (): typeof allPrisons & Page => page('Prison Register', allPrisons)

export default { verifyOnPage }
