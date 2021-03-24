import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AddCourtDetailsPage from '../pages/court-register/addNewCourtDetails'
import AddCourtBuildingPage from '../pages/court-register/addNewCourtBuilding'
import AddCourtContactDetailsPage from '../pages/court-register/addNewCourtContactDetails'
import AddCourtSummaryPage from '../pages/court-register/addNewCourtSummary'
import AddCourtFinishedPage from '../pages/court-register/addNewCourtFinished'

context('Court register', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubCourts', [
      {
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        courtType: 'CROWN',
        active: true,
      },
      {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        courtType: 'MAGISTRATES',
        active: false,
      },
    ])
    cy.task('stubCourt', {
      courtId: 'SHFCC',
      courtName: 'Sheffield Crown Court',
      courtDescription: 'Sheffield Crown Court - Yorkshire',
      courtType: 'CROWN',
      active: true,
    })
    cy.task('stubCourt', {
      courtId: 'SHFMC',
      courtName: 'Sheffield Magistrates Court',
      courtDescription: 'Sheffield Magistrates Court - Yorkshire',
      courtType: 'MAGISTRATES',
      active: false,
    })
    cy.task('stubUpdateCourt')
    cy.task('stubCourtTypes')
    cy.login()
  })

  it('Can navigate to court registers', () => {
    IndexPage.verifyOnPage().courtRegisterLink().should('contain.text', 'Court register').click()
    AllCourtsPage.verifyOnPage()
  })

  it('Will display all courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = AllCourtsPage.verifyOnPage()

    {
      const { code, name, type, status } = courtRegisterPage.courts(0)
      code().contains('SHFCC')
      name().contains('Sheffield Crown Court')
      type().contains('Crown')
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Closed')
    }
  })
  it('Can deactivate open court', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourtsPage.verifyOnPage().viewCourtLink('SHFCC').should('contain.text', 'Sheffield Crown Court').click()
    CourtDetailsPage.verifyOnPage('Sheffield Crown Court').markAsClosedButton().click()
    CourtDetailsPage.verifyOnPage('Sheffield Crown Court').deactivatedConfirmationBlock().should('exist')
  })
  it('Can activate closed court', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').markAsOpenButton().click()
    CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').activatedConfirmationBlock().should('exist')
  })
  describe('adding a new court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().addNewCourtButton().click()
    })
    it('Can navigate to add new court page', () => {
      AddCourtDetailsPage.verifyOnPage()
    })
    describe('when successfully adding a new court', () => {
      beforeEach(() => {
        const courtDetails = AddCourtDetailsPage.verifyOnPage()
        courtDetails.id().type('SHFCC')
        courtDetails.type().select('Crown Court')
        courtDetails.name().type('Sheffield Crown Court')
        courtDetails.description().type('Sheffield Crown Court - South Yorkshire')
        courtDetails.continueButton().click()

        const buildingDetails = AddCourtBuildingPage.verifyOnPage()
        buildingDetails.buildingName().type('Main building')
        buildingDetails.addressLine1().type('Crown Square')
        buildingDetails.addressLine2().type('32 High Street')
        buildingDetails.addressTown().type('Sheffield')
        buildingDetails.addressCounty().type('South Yorkshire')
        buildingDetails.addressPostcode().type('S1 2BJ')
        buildingDetails.addressCountry().type('England')
        buildingDetails.continueButton().click()

        const contactDetails = AddCourtContactDetailsPage.verifyOnPage()
        contactDetails.telephoneNumber().type('0114 555 1234')
        contactDetails.faxNumber().type('0114 555 6767')
        buildingDetails.continueButton().click()

        const summary = AddCourtSummaryPage.verifyOnPage()
        summary.saveButton().click()
      })
      it('Will show success message', () => {
        const finished = AddCourtFinishedPage.verifyOnPage()
        finished.message().contains('Court saved')
        finished.message().contains('SHFCC - Sheffield Crown Court has been saved successfully')
      })
    })
  })
})
