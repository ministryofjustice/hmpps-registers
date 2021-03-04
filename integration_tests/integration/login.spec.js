const IndexPage = require('../pages/index')
const AuthLoginPage = require('../pages/authLogin')
const AuthErrorPage = require('../pages/authError')

context('Login', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    AuthLoginPage.verifyOnPage()
  })
  it('User name visible in header', () => {
    cy.login()
    const landingPage = IndexPage.verifyOnPage()
    landingPage.headerUserName().should('contain.text', 'J. Smith')
  })
  it('User can log out', () => {
    cy.login()
    const landingPage = IndexPage.verifyOnPage()
    landingPage.logout().click()
    AuthLoginPage.verifyOnPage()
  })

  describe('role based access', () => {
    context('without the correct role', () => {
      beforeEach(() => {
        cy.task('stubLogin', ['ROLE_HMPPS_BANANAS'])
      })

      it('Will be shown the not authorised page', () => {
        cy.login({ failOnStatusCode: false })
        AuthErrorPage.verifyOnPage()
      })
    })
    context('with the correct role', () => {
      beforeEach(() => {
        cy.task('stubLogin', ['ROLE_HMPPS_REGISTERS_MAINTAINER'])
      })

      it('Will be shown the home page', () => {
        cy.login({ failOnStatusCode: false })
        IndexPage.verifyOnPage()
      })
    })
  })
})
