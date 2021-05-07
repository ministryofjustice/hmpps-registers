import IndexPage from '../pages'
import AllCourtsPagedPage from '../pages/court-register/allCourtsPaged'
import CourtDetailsPage from '../pages/court-register/courtDetails'
import AmendCourtDetailsPage from '../pages/court-register/amendCourtDetails'
import AmendCourtBuildingPage from '../pages/court-register/amendCourtBuilding'
import AmendCourtBuildingContactsPage from '../pages/court-register/amendCourtBuildingContacts'
import AddCourtBuildingPage from '../pages/court-register/addCourtBuilding'
import {
  sheffieldCrownCourt,
  sheffieldCrownMainBuilding,
  sheffieldMagistratesAnnexeBuilding,
  sheffieldMagistratesCourt,
  sheffieldMagistratesMainBuilding,
  sheffieldYouthCourt,
} from '../mockApis/courtRegister'
import { getRequests } from '../mockApis/wiremock'

type WireMockRequest = { request: { url: string; method: string; body: string } }
type AllWireMockRequest = { requests: WireMockRequest[] }

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
    cy.task('stubCourtBuilding', sheffieldMagistratesAnnexeBuilding)
    cy.task('stubCourtBuilding', sheffieldCrownMainBuilding)
    cy.task('stubAddCourtBuilding')
    cy.task('stubAddCourtBuildingContact')
    cy.task('stubUpdateCourtBuildingContact')
    cy.task('stubDeleteCourtBuildingContact')
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
        .should('contain.text', sheffieldMagistratesCourt.courtName)
        .click()
    })
    it('Can activate closed court', () => {
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).markAsOpenButton().click()
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).activatedConfirmationBlock().should('exist')
    })
    it('should show summary of court with link to amend', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.courtDetailsSection().should('contain.text', sheffieldMagistratesCourt.courtName)
      courtDetailsPage.courtDetailsSection().should('contain.text', 'Sheffield Secondary Court - Yorkshire')
      courtDetailsPage.amendCourtDetailsLink().should('contain.text', 'Change')
    })
    it('can navigate to amend court details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().should('have.value', sheffieldMagistratesCourt.courtName)
      amendCourtDetailsPage.description().should('have.value', 'Sheffield Secondary Court - Yorkshire')
      amendCourtDetailsPage.type().should('have.value', 'MAG')
      amendCourtDetailsPage.saveButton()
    })
    it('will validate court details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().clear().type('A')
      amendCourtDetailsPage.saveButton().click()

      const courtDetailsWithErrors = AmendCourtDetailsPage.verifyOnPage('SHFMC')
      courtDetailsWithErrors.errorSummary().contains('Enter a court name between 2 and 80 characters')
    })
    it('will return to court details page with success message after saving', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendCourtDetailsLink().click()
      const amendCourtDetailsPage = AmendCourtDetailsPage.verifyOnPage('SHFMC')

      amendCourtDetailsPage.name().clear().type('Sheffield Magistrates New Court')
      amendCourtDetailsPage.saveButton().click()

      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court building', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', sheffieldMagistratesCourt.courtName)
        .click()
    })
    it('should show summary of court with link to amend each building', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.buildingDetailsSection('1').should('contain.text', sheffieldMagistratesMainBuilding.buildingName)
      courtDetailsPage.buildingDetailsSection('2').should('contain.text', 'Sheffield Court Annexe')
      courtDetailsPage.amendBuildingDetailsLink('1').should('contain.text', 'Change')
      courtDetailsPage.amendBuildingDetailsLink('2').should('contain.text', 'Change')
    })
    it('will validate court building details page', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingDetailsLink('1').click()
      const amendCourtBuildingDetailPage = AmendCourtBuildingPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingDetailPage.buildingName().clear()
      amendCourtBuildingDetailPage.addressLine1().clear()
      amendCourtBuildingDetailPage.addressTown().clear()
      amendCourtBuildingDetailPage.addressCounty().clear()
      amendCourtBuildingDetailPage.addressPostcode().clear()
      amendCourtBuildingDetailPage.saveButton().click()

      const amendCourtBuildingDetailPageWithErrors = AmendCourtBuildingPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the building name')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the first line of the address')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the town or city')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the postcode')
      amendCourtBuildingDetailPageWithErrors.errorSummary().contains('Enter the county')
    })
    it('will return to court details page with success message after saving', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingDetailsLink('1').click()
      const amendCourtBuildingDetailPage = AmendCourtBuildingPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingDetailPage.addressLine1().type('67 Castle Street')
      amendCourtBuildingDetailPage.saveButton().click()

      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('adding a court building', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', sheffieldMagistratesCourt.courtName)
        .click()
    })
    it('should show summary of court with link to add a building', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.addBuildingLink().click()
      AddCourtBuildingPage.verifyOnPage()
    })
    it('Entering invalid data keeps you on page with error messages', () => {
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).addBuildingLink().click()
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
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).addBuildingLink().click()
      const courtBuilding = AddCourtBuildingPage.verifyOnPage()
      courtBuilding.buildingName().type('Main building')
      courtBuilding.addressLine1().type('Crown Square')
      courtBuilding.addressLine2().type('32 High Street')
      courtBuilding.addressTown().type('Sheffield')
      courtBuilding.addressCounty().type('South Yorkshire')
      courtBuilding.addressPostcode().type('S1 2BJ')
      courtBuilding.addressCountry().check('England')
      courtBuilding.saveButton().click()
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
  })
  describe('amending a court building contacts', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().courtRegisterLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink('SHFMC')
        .should('contain.text', sheffieldMagistratesCourt.courtName)
        .click()
    })
    it('should show summary of court with link to amend each set on contacts', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage
        .buildingDetailsSection(sheffieldMagistratesMainBuilding.id.toString())
        .should('contain.text', sheffieldMagistratesMainBuilding.buildingName)
      courtDetailsPage
        .buildingDetailsSection(sheffieldMagistratesAnnexeBuilding.id.toString())
        .should('contain.text', sheffieldMagistratesAnnexeBuilding.buildingName)
      courtDetailsPage
        .amendBuildingContactsLink(sheffieldMagistratesMainBuilding.id.toString())
        .should('contain.text', 'Change')
      courtDetailsPage
        .amendBuildingContactsLink(sheffieldMagistratesAnnexeBuilding.id.toString())
        .should('contain.text', 'Change')
    })
    it('will display existing contact details with ability to remove a number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldMagistratesMainBuilding.id.toString()).click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.number(0).should('have.value', '0114 555 1234')
      amendCourtBuildingContactsPage.type(0).should('have.value', 'TEL')
      amendCourtBuildingContactsPage.removeButton(0).should('contain.text', 'Remove')

      amendCourtBuildingContactsPage.number(1).should('have.value', '0114 555 4321')
      amendCourtBuildingContactsPage.type(1).should('have.value', 'FAX')
      amendCourtBuildingContactsPage.removeButton(1).should('contain.text', 'Remove')
    })
    it('should validate a changed number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldMagistratesMainBuilding.id.toString()).click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.number(0).clear()
      amendCourtBuildingContactsPage.saveButton().click()

      const amendCourtBuildingContactsPageWithErrors = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )
      amendCourtBuildingContactsPageWithErrors.errorSummary().contains('Enter the number')
    })
    it('should validate a new number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldMagistratesMainBuilding.id.toString()).click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.addAnotherNumberButton().click()
      amendCourtBuildingContactsPage.saveButton().click()

      const amendCourtBuildingContactsPageWithErrors = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )
      amendCourtBuildingContactsPageWithErrors.errorSummary().contains('Enter the number')
    })
    it('can a add new number but then remove it', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.addAnotherNumberButton().click()
      amendCourtBuildingContactsPage.lastRemoveButton().click()
      amendCourtBuildingContactsPage.saveButton().click()
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })

    it('can remove one of the numbers', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.removeButton(1).click()
      amendCourtBuildingContactsPage.number(0).should('exist')
      amendCourtBuildingContactsPage.type(0).should('exist')
      amendCourtBuildingContactsPage.number(1).should('not.exist')
      amendCourtBuildingContactsPage.type(1).should('not.exist')

      amendCourtBuildingContactsPage
        .saveButton()
        .click()
        .then(deleteContactRequests)
        .then(requests => {
          expect(requests).to.have.lengthOf(1)
          expect(requests[0].request.url).to.equal(
            `/court-register/court-maintenance/id/${sheffieldMagistratesCourt.courtId}/buildings/${sheffieldMagistratesMainBuilding.id}/contacts/2`
          )
        })
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
    it('can amend one of the numbers', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink('1').click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.type(0).select('FAX')
      amendCourtBuildingContactsPage.number(0).clear().type('0114 555 999')

      amendCourtBuildingContactsPage
        .saveButton()
        .click()
        .then(amendContactRequests)
        .then(requests => {
          expect(requests).to.have.lengthOf(1)
          expect(requests[0].request.url).to.equal('/court-register/court-maintenance/id/SHFMC/buildings/1/contacts/1')
          expect(JSON.parse(requests[0].request.body)).to.eqls({
            type: 'FAX',
            detail: '0114 555 999',
          })
        })
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
    it('can add a new number', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldMagistratesMainBuilding.id.toString()).click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.addAnotherNumberButton().click()

      amendCourtBuildingContactsPage.number(2).type('0114 555 999')
      amendCourtBuildingContactsPage.type(2).select('FAX')

      amendCourtBuildingContactsPage
        .saveButton()
        .click()
        .then(addContactRequests)
        .then(requests => {
          expect(requests).to.have.lengthOf(1)
          expect(requests[0].request.url).to.equal(
            `/court-register/court-maintenance/id/${sheffieldMagistratesCourt.courtId}/buildings/${sheffieldMagistratesMainBuilding.id}/contacts`
          )

          expect(JSON.parse(requests[0].request.body)).to.eqls({
            type: 'FAX',
            detail: '0114 555 999',
          })
        })
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
    it('can add a new (trimmed) number when none are present to begin with', () => {
      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldMagistratesAnnexeBuilding.id.toString()).click()
      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldMagistratesAnnexeBuilding.buildingName
      )

      // will display empty fields defaulted to telephone
      amendCourtBuildingContactsPage.number(0).should('have.value', '')
      amendCourtBuildingContactsPage.type(0).should('have.value', 'TEL')

      amendCourtBuildingContactsPage.number(0).type('0114 555 999   ')
      amendCourtBuildingContactsPage.type(0).select('FAX')

      amendCourtBuildingContactsPage
        .saveButton()
        .click()
        .then(addContactRequests)
        .then(requests => {
          expect(requests).to.have.lengthOf(1)
          expect(requests[0].request.url).to.equal(
            `/court-register/court-maintenance/id/${sheffieldMagistratesCourt.courtId}/buildings/${sheffieldMagistratesAnnexeBuilding.id}/contacts`
          )
          expect(JSON.parse(requests[0].request.body).detail).to.equal('0114 555 999')
          expect(JSON.parse(requests[0].request.body)).to.eqls({
            type: 'FAX',
            detail: '0114 555 999',
          })
        })
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).courtUpdatedConfirmationBlock().should('exist')
    })
    it('cannot remove last number', () => {
      CourtDetailsPage.verifyOnPage(sheffieldMagistratesCourt.courtName).backLink().click()
      AllCourtsPagedPage.verifyOnPage()
        .viewCourtLink(sheffieldCrownCourt.courtId)
        .should('contain.text', sheffieldCrownCourt.courtName)
        .click()

      const courtDetailsPage = CourtDetailsPage.verifyOnPage(sheffieldCrownCourt.courtName)
      courtDetailsPage.amendBuildingContactsLink(sheffieldCrownMainBuilding.id.toString()).click()

      const amendCourtBuildingContactsPage = AmendCourtBuildingContactsPage.verifyOnPage(
        sheffieldCrownMainBuilding.buildingName
      )

      amendCourtBuildingContactsPage.anyRemoveButton().should('not.exist')
    })
  })
})

const geRequestsFor = (filter: (request: WireMockRequest) => boolean) =>
  getRequests().then((response: { body: AllWireMockRequest }) => response.body.requests.filter(filter))

const isDeleteContactRequest = (request: WireMockRequest) =>
  request.request.url.match('/court-maintenance/id/.*/buildings/.*/contacts/.*') && request.request.method === 'DELETE'

const isAmendContactRequest = (request: WireMockRequest) =>
  request.request.url.match('/court-maintenance/id/.*/buildings/.*/contacts/.*') && request.request.method === 'PUT'

const isAddContactRequest = (request: WireMockRequest) =>
  request.request.url.match('/court-maintenance/id/.*/buildings/.*/contacts') && request.request.method === 'POST'

const deleteContactRequests = () => geRequestsFor(isDeleteContactRequest)

const amendContactRequests = () => geRequestsFor(isAmendContactRequest)

const addContactRequests = () => geRequestsFor(isAddContactRequest)
