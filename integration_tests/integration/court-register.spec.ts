import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AddCourtDetailsPage from '../pages/court-register/addNewCourtDetails'
import AddCourtBuildingPage from '../pages/court-register/addNewCourtBuilding'
import AddCourtContactDetailsPage from '../pages/court-register/addNewCourtContactDetails'
import AddCourtSummaryPage from '../pages/court-register/addNewCourtSummary'
import AddCourtFinishedPage from '../pages/court-register/addNewCourtFinished'
import AmendCourtDetailsPage from '../pages/court-register/amendCourtDetails'

context('Court register', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubAllCourts', [
      {
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        type: { courtType: 'CRN', courtName: 'Crown' },
        active: true,
        buildings: [],
      },
      {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        type: { courtType: 'MAG', courtName: 'Magistrates' },
        active: false,
        buildings: [],
      },
    ])
    cy.task('stubPageOfCourts', {
      content: [
        {
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          type: { courtType: 'CRN', courtName: 'Crown' },
          active: true,
          buildings: [],
        },
        {
          courtId: 'SHFMC',
          courtName: 'Sheffield Magistrates Court',
          courtDescription: 'Sheffield Magistrates Court - Yorkshire',
          type: { courtType: 'MAG', courtName: 'Magistrates' },
          active: true,
          buildings: [],
        },
        {
          courtId: 'SHFYC',
          courtName: 'Sheffield Youth Court',
          courtDescription: 'Sheffield Youth Court - Yorkshire',
          type: { courtType: 'YOUTH', courtName: 'Youth' },
          active: false,
          buildings: [],
        },
      ],
      last: false,
      totalPages: 2,
      totalElements: 4,
      number: 0,
      size: 3,
      first: true,
      numberOfElements: 3,
      empty: false,
    })
    cy.task('stubCourt', {
      courtId: 'SHFCC',
      courtName: 'Sheffield Crown Court',
      courtDescription: 'Sheffield Crown Court - Yorkshire',
      type: { courtType: 'CRN', courtName: 'Crown' },
      active: true,
      buildings: [],
    })
    cy.task('stubCourt', {
      courtId: 'SHFMC',
      courtName: 'Sheffield Magistrates Court',
      courtDescription: 'Sheffield Magistrates Court - Yorkshire',
      type: { courtType: 'MAG', courtName: 'Magistrates' },
      active: false,
      buildings: [],
    })
    cy.task('stubUpdateCourt')
    cy.task('stubCourtTypes')
    cy.task('stubAddCourt')
    cy.task('stubAddCourtBuilding')
    cy.task('stubAddCourtBuildingContact')
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

  it('Will display a page of courts', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removing the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const courtRegisterPagedPage = AllCourtsPagedPage.verifyOnPage()

    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(0)
      code().contains('SHFCC')
      name().contains('Sheffield Crown Court')
      type().contains('Crown')
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPagedPage.courts(2)
      code().contains('SHFYC')
      name().contains('Sheffield Youth Court')
      type().contains('Youth')
      status().contains('Closed')
    }
  })
  it('Will display pagination controls', () => {
    // IndexPage.verifyOnPage().courtRegisterLink().click()  -  TODO Will need this when plumbing in the paged court list and removign the all courts list
    IndexPage.verifyOnPage()
    cy.visit('/court-register/paged') // TODO and this will need removing
    const courtRegisterPagedPage = AllCourtsPagedPage.verifyOnPage()

    const pageLinks = courtRegisterPagedPage.pageLinks()
    pageLinks.then(items => {
      // TODO There must be a better way than this?
      expect(items[0].href).to.equal(undefined)
      expect(items[0].text).to.equal('1')
      expect(items[0].selected).to.equal(true)
      expect(items[1].href).to.equal('/court-register/paged?page=2')
      expect(items[1].text).to.equal('2')
      expect(items[1].selected).to.equal(false)
      expect(items[2].href).to.equal('/court-register/paged?page=2')
      expect(items[2].text).to.contain('Next')
      expect(items[2].selected).to.equal(false)
    })

    const pageResults = courtRegisterPagedPage.pageResults()
    pageResults.contains('Showing 1 to 3 of 4 results')
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
  describe('amending a court', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    })
    it('should show summary of court with link to amend', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.courtDetailsSection().should('contain.text', 'Sheffield Magistrates Court')
      courtDetailsPage.courtDetailsSection().should('contain.text', 'Sheffield Magistrates Court - Yorkshire')
      courtDetailsPage.amendCourtDetailsLink().should('contain.text', 'Change')
    })
    it('can navigate to amend court details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court')
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().should('have.value', 'Sheffield Magistrates Court')
      amendCourtDetailsPage.description().should('have.value', 'Sheffield Magistrates Court - Yorkshire')
      amendCourtDetailsPage.type().should('have.value', 'MAG')
      amendCourtDetailsPage.saveButton().should('contain.text', 'Save')
    })
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
      AllCourtsPage.verifyOnPage().addNewCourtButton().click()
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
        courtDetails.id().type('SHFXX')
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
