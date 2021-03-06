import Chainable = Cypress.Chainable

export interface Page {
  logout: () => Chainable
  checkStillOnPage: () => Chainable
}

export default (name: string, pageObject = {}): Page => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout }
}
