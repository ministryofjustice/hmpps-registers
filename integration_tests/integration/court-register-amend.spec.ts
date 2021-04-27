import IndexPage from '../pages'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AmendCourtDetailsPage from '../pages/court-register/amendCourtDetails'
import AmendCourtBuildingPage from '../pages/court-register/amendCourtBuilding'
import AmendCourtBuildingContactsPage from '../pages/court-register/amendCourtBuildingContacts'
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
    cy.task('stubAddCourtBuilding')
  })

  describe('amending a open court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage().viewCourtLink('SHFCC').should('contain.text', 'Sheffield Crown Court').click()
    })
    it('Can deactivate open court', () => {
      CourtDetailsPage.verifyOnPage('Sheffield Crown Court').markAsClosedButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Crown Court').deactivatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', 'Sheffield Magistrates Court')
        .click()
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
      courtDetailsWithErrors.errorSummary().contains('Enter a court name between 2 and 200 characters')
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
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', 'Sheffield Magistrates Court')
        .click()
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
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', 'Sheffield Magistrates Court')
        .click()
    })
    it('should show summary of court with link to add a building', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.addBuildingLink().click()
      AddCourtBuildingPage.verifyOnPage()
    })
    it('Entering invalid data keeps you on page with error messages', () => {
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').addBuildingLink().click()
      const courtBuilding = AddCourtBuildingPage.verifyOnPage()
      courtBuilding.buildingName().type(' ')
      courtBuilding.addressLine1().type(' ')
      courtBuilding.addressTown().type(' ')
      courtBuilding.addressCounty().type(' ')
      courtBuilding.addressPostcode().type(' ')
      courtBuilding.saveButton().click()

      const courtBuildingWithErrors = AddCourtBuildingPage.verifyOnPage()
      courtBuildingWithErrors.errorSummary().contains('Enter the building name')
      courtBuildingWithErrors.errorSummary().contains('Enter the first line of the address')
      courtBuildingWithErrors.errorSummary().contains('Enter the town or city')
      courtBuildingWithErrors.errorSummary().contains('Enter the postcode')
      courtBuildingWithErrors.errorSummary().contains('Enter the county')
      courtBuildingWithErrors.errorSummary().contains('Select the country')
    })
    it('should return to court details page with success message', () => {
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').addBuildingLink().click()
      const courtBuilding = AddCourtBuildingPage.verifyOnPage()
      courtBuilding.buildingName().type('Main building')
      courtBuilding.addressLine1().type('Crown Square')
      courtBuilding.addressLine2().type('32 High Street')
      courtBuilding.addressTown().type('Sheffield')
      courtBuilding.addressCounty().type('South Yorkshire')
      courtBuilding.addressPostcode().type('S1 2BJ')
      courtBuilding.addressCountry().check('England')
      courtBuilding.saveButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court building contacts', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', 'Sheffield Magistrates Court')
        .click()
    })
    it('should show summary of court with link to amend each set on contacts', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.buildingDetailsSection('1').should('contain.text', 'Sheffield Courts')
      courtDetailsPage.buildingDetailsSection('2').should('contain.text', 'Sheffield Court Annexe')
      courtDetailsPage.amendBuildingContactsLink('1').should('contain.text', 'Change')
      courtDetailsPage.amendBuildingContactsLink('2').should('contain.text', 'Change')
    })
    it('will display existing contact details with ability to remove a number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingContactsPage.number(0).should('have.value', '0114 555 1234')
      amendCourtBuildingContactsPage.type(0).should('have.value', 'TEL')
      amendCourtBuildingContactsPage.removeButton(0).should('contain.text', 'Remove')

      amendCourtBuildingContactsPage.number(1).should('have.value', '0114 555 4321')
      amendCourtBuildingContactsPage.type(1).should('have.value', 'FAX')
      amendCourtBuildingContactsPage.removeButton(1).should('contain.text', 'Remove')
    })
    it('should validate a changed number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingContactsPage.number(0).clear()
      amendCourtBuildingContactsPage.saveButton().click()

      const amendCourtBuildingContactsPageWithErrors = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')
      amendCourtBuildingContactsPageWithErrors.errorSummary().contains('Enter the number')
    })
    it('should validate a new number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingContactsPage.addAnotherNumberButton().click()
      amendCourtBuildingContactsPage.saveButton().click()

      const amendCourtBuildingContactsPageWithErrors = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')
      amendCourtBuildingContactsPageWithErrors.errorSummary().contains('Enter the number')
    })
    it('can a add new number but then remove it', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingContactsPage.addAnotherNumberButton().click()
      amendCourtBuildingContactsPage.lastRemoveButton().click()
      amendCourtBuildingContactsPage.saveButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').courtUpdatedConfirmationBlock().should('exist')
    })
    it('can remove one of the numbers', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage('Sheffield Courts')

      amendCourtBuildingContactsPage.removeButton(1).click()
      amendCourtBuildingContactsPage.number(0).should('exist')
      amendCourtBuildingContactsPage.type(0).should('exist')
      amendCourtBuildingContactsPage.number(1).should('not.exist')
      amendCourtBuildingContactsPage.type(1).should('not.exist')

      amendCourtBuildingContactsPage.saveButton().click()
      CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').courtUpdatedConfirmationBlock().should('exist')
    })
  })
})
