import Chainable = Cypress.Chainable

export type Page = {
  logout: () => Chainable
  checkStillOnPage: () => Chainable
}
export default <T>(name: string, pageObject: T): Page & T => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout }
}
