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
}

const verifyOnPage = (): typeof allCourts & Page => page('Court Register', allCourts)

export default { verifyOnPage }
