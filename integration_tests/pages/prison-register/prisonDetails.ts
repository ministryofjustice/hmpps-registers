import page, { Page } from '../page'

const prisonDetails = {
  prisonDetailsSection: () => cy.get('[data-qa=prison-summary-section]'),
}

const verifyOnPage = (prisonName: string): typeof prisonDetails & Page => page(prisonName, prisonDetails)

export default { verifyOnPage }
