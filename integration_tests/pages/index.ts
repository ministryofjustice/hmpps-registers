import page from './page'
import type { Page } from './page'

const index = {
  headerUserName: () => cy.get('[data-qa=header-user-name]'),
  prisonRegisterLink: () => cy.get('[href="/prison-register"]'),
}

const verifyOnPage = (): Page & typeof index => page('HMPPS Registers', index)

export default { verifyOnPage }
