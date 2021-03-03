module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  const viewCourtLink = courtId => cy.get(`[href="/court-register/details?id=${courtId}"]`).first()
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout, viewCourtLink }
}
