import IndexPage from '../pages'
import AuthSignInPage from '../pages/authSignIn'
import AuthErrorPage from '../pages/authError'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    AuthSignInPage.verifyOnPage()
  })
  it('User name visible in header', () => {
    cy.signIn()
    const landingPage = IndexPage.verifyOnPage()
    landingPage.headerUserName().should('contain.text', 'J. Smith')
  })
  it('User can log out', () => {
    cy.signIn()
    const landingPage = IndexPage.verifyOnPage()
    landingPage.logout().click()
    AuthSignInPage.verifyOnPage()
  })

  describe('role based access', () => {
    context('without the correct role', () => {
      beforeEach(() => {
        cy.task('stubSignIn', ['ROLE_HMPPS_BANANAS'])
      })

      it('Will be shown the not authorised page', () => {
        cy.signIn({ failOnStatusCode: false })
        AuthErrorPage.verifyOnPage()
      })
    })
    context('with the correct role', () => {
      beforeEach(() => {
        cy.task('stubSignIn', ['ROLE_HMPPS_REGISTERS_MAINTAINER'])
      })

      it('Will be shown the home page', () => {
        cy.signIn({ failOnStatusCode: false })
        IndexPage.verifyOnPage()
      })
    })
  })
})
