import page from './page'
import type { Page } from './page'

const index = {
  headerUserName: () => cy.get('[data-qa=header-user-name]'),
  courtRegisterLink: () => cy.get('[href="/court-register"]'),
}

const verifyOnPage = (): Page & typeof index => page('HMPPS Registers', index)

export default { verifyOnPage }
