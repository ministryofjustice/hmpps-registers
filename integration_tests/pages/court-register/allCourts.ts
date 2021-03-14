import page from '../page'
import type { Page } from '../page'
import Chainable = Cypress.Chainable

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('courts', rowNumber).find('td').eq(columnNumber)

interface AllCourtsPage {
  courts: (rowNumber) => CourtElement
  viewCourtLink: (courtId) => Chainable
}

interface CourtElement {
  code: () => Chainable
  name: () => Chainable
  type: () => Chainable
  status: () => Chainable
}

const allCourts = (): AllCourtsPage & Page =>
  page<AllCourtsPage>('Court Register', {
    courts: rowNumber => ({
      code: () => column(rowNumber, 0),
      name: () => column(rowNumber, 1),
      type: () => column(rowNumber, 2),
      status: () => column(rowNumber, 3),
    }),
    viewCourtLink: courtId => cy.get(`[href="/court-register/details?id=${courtId}"]`).first(),
  })

export default { verifyOnPage: allCourts }
