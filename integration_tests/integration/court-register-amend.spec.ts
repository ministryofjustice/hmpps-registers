import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AmendCourtDetailsPage from '../pages/court-register/amendCourtDetails'
import AmendCourtBuildingPage from '../pages/court-register/amendCourtBuilding'
import AddCourtBuildingPage from '../pages/court-register/addCourtBuilding'
import {
  sheffieldCrownCourt,
  sheffieldMagistratesCourt,
  sheffieldMagistratesMainBuilding,
  sheffieldYouthCourt,
} from '../mockApis/courtRegister'

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
    cy.task('stubUpdateCourtBuilding')
    cy.task('stubCourtTypes')
    cy.login()
    cy.task('stubCourtBuilding', sheffieldMagistratesMainBuilding)
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
    it('will validate court details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().clear().type('A')
      amendCourtDetailsPage.saveButton().click()

      const courtDetailsWithErrors = AmendCourtDetailsPage.verifyOnPage('SHFMC')
      courtDetailsWithErrors.errorSummary().contains('Court name must be at least 2 characters')
    })
    it('will return to court details page with success message after saving', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().clear().type('Sheffield Magistrates New Court')
      amendCourtDetailsPage.saveButton().click()

      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court building', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    })
    it('should show summary of court with link to amend each building', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.buildingDetailsSection('1').should('contain.text', 'Sheffield Courts')
      courtDetailsPage.buildingDetailsSection('2').should('contain.text', 'Sheffield Court Annexe')
      courtDetailsPage.amendBuildingDetailsLink('1').should('contain.text', 'Change')
      courtDetailsPage.amendBuildingDetailsLink('2').should('contain.text', 'Change')
    })
    it('will validate court building details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingDetailsLink('1').click()
      const amendCourtBuildingDetailPage = AmendCourtBuildingPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingDetailPage.buildingName().clear()
      amendCourtBuildingDetailPage.addressLine1().clear()
      amendCourtBuildingDetailPage.addressTown().clear()
      amendCourtBuildingDetailPage.addressCounty().clear()
      amendCourtBuildingDetailPage.addressPostcode().clear()
      amendCourtBuildingDetailPage.saveButton().click()

      const amendCourtBuildingDetailPageWithErrors = AmendCourtBuildingPage.verifyOnPage('Sheffield Courts')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the building name')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the first line of the address')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the town or city')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the postcode')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the county')
    })
    it('will return to court details page with success message after saving', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingDetailsLink('1').click()
      const amendCourtBuildingDetailPage = AmendCourtBuildingPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingDetailPage.addressLine1().type('67 Castle Street')
      amendCourtBuildingDetailPage.saveButton().click()

      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('adding a court building', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    })
    it('should show summary of court with link to add a building', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.addBuildingLink().click()
      AddCourtBuildingPage.verifyOnPage()
    })
  })
})
