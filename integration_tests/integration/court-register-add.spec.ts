import IndexPage from '../pages'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import AddCourtDetailsPage from '../pages/court-register/addNewCourtDetails'
import AddCourtBuildingPage from '../pages/court-register/addNewCourtBuilding'
import AddCourtContactDetailsPage from '../pages/court-register/addNewCourtContactDetails'
import AddCourtSummaryPage from '../pages/court-register/addNewCourtSummary'
import AddCourtFinishedPage from '../pages/court-register/addNewCourtFinished'
import { sheffieldCrownCourt, sheffieldMagistratesCourt, sheffieldYouthCourt } from '../mockApis/courtRegister'

context('Court register - Add new court', () => {
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
    cy.task('stubCourtTypes')
    cy.task('stubCourt', sheffieldCrownCourt)
    cy.task('stubCourt', sheffieldMagistratesCourt)
    cy.task('stubAddCourt')
    cy.task('stubAddCourtBuilding')
    cy.task('stubAddCourtBuildingContact')
    cy.login()
  })

  describe('adding a new court', () => {
    const fillCourtDetailsPage = (id = 'SHXCC') => {
      const courtDetails = AddCourtDetailsPage.verifyOnPage()
      courtDetails.id().type(id)
      courtDetails.type().select('Crown Court')
      courtDetails.name().type('Sheffield Crown Court')
      courtDetails.description().type('Sheffield Crown Court - South Yorkshire')
      courtDetails.continueButton().click()
    }
    const fillCourtBuildingPage = () => {
      const buildingDetails = AddCourtBuildingPage.verifyOnPage()
      buildingDetails.buildingName().type('Main building')
      buildingDetails.addressLine1().type('Crown Square')
      buildingDetails.addressLine2().type('32 High Street')
      buildingDetails.addressTown().type('Sheffield')
      buildingDetails.addressCounty().type('South Yorkshire')
      buildingDetails.addressPostcode().type('S1 2BJ')
      buildingDetails.addressCountry().check('England')
      buildingDetails.continueButton().click()
    }
    const fillCourtContactDetailsPage = () => {
      const contactDetails = AddCourtContactDetailsPage.verifyOnPage()
      contactDetails.telephoneNumber().type('0114 555 1234')
      contactDetails.faxNumber().type('0114 555 6767')
      contactDetails.continueButton().click()
    }
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage().addNewCourtButton().click()
    })
    it('Can navigate to add new court page', () => {
      AddCourtDetailsPage.verifyOnPage()
    })

    describe('add new court details', () => {
      it('Entering valid data allows moving to build page', () => {
        fillCourtDetailsPage()
        AddCourtBuildingPage.verifyOnPage()
      })
      it('Entering invalid data keeps you on page with error messages', () => {
        const courtDetails = AddCourtDetailsPage.verifyOnPage()
        courtDetails.id().type(' ')
        courtDetails.name().type(' ')
        courtDetails.description().type(' ')
        courtDetails.continueButton().click()

        const courtDetailsWithErrors = AddCourtDetailsPage.verifyOnPage()
        courtDetailsWithErrors.errorSummary().contains('Enter a court name')
        courtDetailsWithErrors.errorSummary().contains('Enter a court code')
        courtDetailsWithErrors.errorSummary().contains('Select a court type')
      })
      it('Entering court id for existing court keeps you on page with error messages', () => {
        fillCourtDetailsPage('SHFCC')

        const courtDetailsWithErrors = AddCourtDetailsPage.verifyOnPage()
        courtDetailsWithErrors.errorSummary().contains('Choose another code')
      })
    })
    describe('add new court building', () => {
      beforeEach(() => {
        fillCourtDetailsPage()
      })
      it('Entering valid data allows moving to contact page', () => {
        fillCourtBuildingPage()
        AddCourtContactDetailsPage.verifyOnPage()
      })
      it('Entering invalid data keeps you on page with error messages', () => {
        const courtBuilding = AddCourtBuildingPage.verifyOnPage()
        courtBuilding.buildingName().type(' ')
        courtBuilding.addressLine1().type(' ')
        courtBuilding.addressTown().type(' ')
        courtBuilding.addressCounty().type(' ')
        courtBuilding.addressPostcode().type(' ')
        courtBuilding.continueButton().click()

        const courtBuildingWithErrors = AddCourtBuildingPage.verifyOnPage()
        courtBuildingWithErrors.errorSummary().contains('Enter the building name')
        courtBuildingWithErrors.errorSummary().contains('Enter the first line of the address')
        courtBuildingWithErrors.errorSummary().contains('Enter the town or city')
        courtBuildingWithErrors.errorSummary().contains('Enter the postcode')
        courtBuildingWithErrors.errorSummary().contains('Enter the county')
        courtBuildingWithErrors.errorSummary().contains('Select the country')
      })
    })
    describe('add new court contact details', () => {
      beforeEach(() => {
        fillCourtDetailsPage()
        fillCourtBuildingPage()
      })
      it('Entering valid data allows moving to contact page', () => {
        fillCourtContactDetailsPage()
        AddCourtSummaryPage.verifyOnPage()
      })
      it('Entering invalid data keeps you on page with error messages', () => {
        const courtContactDetails = AddCourtContactDetailsPage.verifyOnPage()
        courtContactDetails.telephoneNumber().type(' ')
        courtContactDetails.continueButton().click()

        const courtContactDetailsWithErrors = AddCourtContactDetailsPage.verifyOnPage()
        courtContactDetailsWithErrors.errorSummary().contains('Enter the telephone number')
      })
    })
    describe('viewing the summary page', () => {
      beforeEach(() => {
        fillCourtDetailsPage()
        fillCourtBuildingPage()
        fillCourtContactDetailsPage()
      })
      it('shows court details and can amend them', () => {
        const summaryPage = AddCourtSummaryPage.verifyOnPage()

        summaryPage.courtDetails().contains('Crown Court')
        summaryPage.courtDetails().contains('SHXCC')
        summaryPage.courtDetails().contains('Sheffield Crown Court')
        summaryPage.courtDetails().contains('Sheffield Crown Court - South Yorkshire')

        summaryPage.changeCourtDetailsLink().click()

        const courtDetails = AddCourtDetailsPage.verifyOnPage()
        courtDetails.id().clear().type('SHFXX')
        courtDetails.continueButton().click()

        const summaryPageAfterChange = AddCourtSummaryPage.verifyOnPage()

        summaryPageAfterChange.courtDetails().contains('SHFXX')
      })
      it('shows building details and can amend them', () => {
        const summaryPage = AddCourtSummaryPage.verifyOnPage()

        summaryPage.buildingDetails().contains('Main building')
        summaryPage.buildingDetails().contains('Crown Square')
        summaryPage.buildingDetails().contains('32 High Street')
        summaryPage.buildingDetails().contains('Sheffield')
        summaryPage.buildingDetails().contains('South Yorkshire')
        summaryPage.buildingDetails().contains('S1 2BJ')
        summaryPage.buildingDetails().contains('England')

        summaryPage.changeBuildingDetailsLink().click()

        const courtBuilding = AddCourtBuildingPage.verifyOnPage()
        courtBuilding.buildingName().type('Big building')
        courtBuilding.continueButton().click()

        const summaryPageAfterChange = AddCourtSummaryPage.verifyOnPage()
        summaryPageAfterChange.buildingDetails().contains('Big building')
      })
      it('shows contact details and can amend them', () => {
        const summaryPage = AddCourtSummaryPage.verifyOnPage()

        summaryPage.contactDetails().contains('0114 555 1234')
        summaryPage.contactDetails().contains('0114 555 6767')

        summaryPage.changeContactDetailsLink().click()

        const courtContactDetails = AddCourtContactDetailsPage.verifyOnPage()
        courtContactDetails.telephoneNumber().type('0114 888 1234')
        courtContactDetails.continueButton().click()

        const summaryPageAfterChange = AddCourtSummaryPage.verifyOnPage()
        summaryPageAfterChange.contactDetails().contains('0114 888 1234')
      })
    })
    describe('when successfully adding a new court', () => {
      beforeEach(() => {
        fillCourtDetailsPage()
        fillCourtBuildingPage()
        fillCourtContactDetailsPage()

        const summary = AddCourtSummaryPage.verifyOnPage()
        summary.saveButton().click()
      })
      it('Will show success message', () => {
        const finished = AddCourtFinishedPage.verifyOnPage()
        finished.message().contains('Court saved')
        finished.message().contains('SHXCC - Sheffield Crown Court has been saved successfully')
      })
    })
  })
})
