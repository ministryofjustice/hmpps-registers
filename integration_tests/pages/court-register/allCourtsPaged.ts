import page from '../page'
import type { Page } from '../page'

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
}

const verifyOnPage = (): typeof allCourtsPaged & Page => page('Court Register Paged', allCourtsPaged)

export default { verifyOnPage }
