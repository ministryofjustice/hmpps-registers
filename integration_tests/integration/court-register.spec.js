const IndexPage = require('../pages/index')
const CourtRegisterPage = require('../pages/court-register')

context('Court register', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.login()
  })

  it('Can navigate to court registers', () => {
    const landingPage = IndexPage.verifyOnPage()
    landingPage.courtRegisterLink().should('contain.text', 'Court register')
    landingPage.courtRegisterLink().click()
    CourtRegisterPage.verifyOnPage()
  })
})
