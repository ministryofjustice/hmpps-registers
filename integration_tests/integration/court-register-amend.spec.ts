import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AmendCourtDetailsPage from '../pages/court-register/amendCourtDetails'
import { sheffieldCrownCourt, sheffieldMagistratesCourt, sheffieldYouthCourt } from '../mockApis/courtRegister'

context('Court register - amend existing court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubAllCourts', [sheffieldCrownCourt, sheffieldMagistratesCourt])
    cy.task('stubPageOfCourts', {
      content: [sheffieldCrownCourt, { ...sheffieldMagistratesCourt, active: true }, sheffieldYouthCourt],
      last: false,
      totalPages: 2,
      totalElements: 4,
      number: 0,
      size: 3,
      first: true,
      numberOfElements: 3,
      empty: false,
    })
    cy.task('stubCourt', sheffieldCrownCourt)
    cy.task('stubCourt', sheffieldMagistratesCourt)
    cy.task('stubUpdateCourt')
    cy.task('stubCourtTypes')
    cy.login()
  })

  describe('amending a open court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().viewCourtLink('SHFCC').should('contain.text', 'Sheffield Crown Court').click()
    })
    it('Can deactivate open court', () => {
      CourtDetailsPage.verifyOnPage('Sheffield Crown Court').markAsClosedButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Crown Court').deactivatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    })
    it('Can activate closed court', () => {
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').markAsOpenButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').activatedConfirmationBlock().should('exist')
    })
    it('should show summary of court with link to amend', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.courtDetailsSection().should('contain.text', 'Sheffield Magistrates Court')
      courtDetailsPage.courtDetailsSection().should('contain.text', 'Sheffield Secondary Court - Yorkshire')
      courtDetailsPage.amendCourtDetailsLink().should('contain.text', 'Change')
    })
    it('can navigate to amend court details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().should('have.value', 'Sheffield Magistrates Court')
      amendCourtDetailsPage.description().should('have.value', 'Sheffield Secondary Court - Yorkshire')
      amendCourtDetailsPage.type().should('have.value', 'MAG')
      amendCourtDetailsPage.saveButton()
    })
  })
})
