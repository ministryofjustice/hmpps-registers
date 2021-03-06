import page, { Page } from '../page'
import Chainable = Cypress.Chainable

const row = (type: string, rowNumber: number) => cy.get(`[data-qa=${type}] tbody tr`).eq(rowNumber)
const column = (rowNumber: number, columnNumber: number) => row('courts', rowNumber).find('td').eq(columnNumber)

interface AllCourtsPage extends Page {
  courts: (rowNumber: number) => CourtElement
  viewCourtLink: (courtCode: string) => Chainable<Element>
}

interface CourtElement {
  code: () => Chainable<Element>
  name: () => Chainable<Element>
  type: () => Chainable<Element>
  status: () => Chainable<Element>
}

const allCourts = (): AllCourtsPage =>
  page('Court Register', {
    courts: rowNumber => ({
      code: () => column(rowNumber, 0),
      name: () => column(rowNumber, 1),
      type: () => column(rowNumber, 2),
      status: () => column(rowNumber, 3),
    }),
    viewCourtLink: courtId => cy.get(`[href="/court-register/details?id=${courtId}"]`).first(),
  }) as AllCourtsPage

export default { verifyOnPage: allCourts }
