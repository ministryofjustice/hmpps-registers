import { localAuthorities } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyLocalAuthority from '../pages/components/edit/updateAgencyLocalAuthority'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  localAuthority: localAuthorities[0],
})
const unchangedFields = {
  courtName: court.courtName,
  description: court.description,
  active: court.active,
  inactiveDate: court.inactiveDate,
  cjitCode: court.cjitCode,
  accessibleAccess: court.accessibleAccess,
  areaCode: court.area.code,
  regionCode: court.region.code,
  geographicalAreaCode: court.geographicalArea.code,
  payrollRegionCode: court.payrollRegion.code,
  courtTypeCode: court.courtType.code,
}
const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateLocalAuthorityLink().click()
  return UpdateAgencyLocalAuthority.verifyOnPage(court.courtName)
}

context('Court register - update local authority', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court])
    cy.task('stubGetCourt', court)
    cy.task('stubUpdateCourt', court.courtId)
    cy.task('stubGetLocalAuthorities', localAuthorities)
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(court.courtId).click()
  })

  it('will provide a link to update local authority and prefill the current value', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateLocalAuthorityLink()
      .should('have.attr', 'href', '/court-register/local-authority/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.localAuthority().should('have.value', 'Sheffield')
    updatePage.code().should('have.value', 'SHEF')
  })

  it('will prefill an empty local authority when none is assigned', () => {
    cy.task('stubGetCourt', { ...court, localAuthority: null })
    const updatePage = openUpdatePage()
    updatePage.localAuthority().should('have.value', '')
    updatePage.code().should('have.value', '')
  })

  it('will search local authorities and submit the selected code while showing only its description', () => {
    cy.intercept('GET', '/api/search-local-authority?*').as('search')
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('lEe')
    cy.wait('@search').its('response.body').should('deep.equal', [localAuthorities[1]])
    updatePage.suggestions().should('contain.text', 'Leeds')
    updatePage.suggestions().should('not.contain.text', 'LEED')
    updatePage.suggestions().contains('Leeds').click()
    updatePage.localAuthority().should('have.value', 'Leeds')
    updatePage.code().should('have.value', 'LEED')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, localAuthorityCode: 'LEED' }])
  })

  it('will save an unchanged local authority', () => {
    openUpdatePage().saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, localAuthorityCode: 'SHEF' }])
  })

  it('will select a local authority using the keyboard', () => {
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Lee')
    updatePage.suggestions().should('have.length', 1).and('contain.text', 'Leeds')
    updatePage.localAuthority().type('{downarrow}{enter}')
    updatePage.code().should('have.value', 'LEED')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, localAuthorityCode: 'LEED' }])
  })

  it('will clear an existing local authority', () => {
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [unchangedFields])
  })

  it('will cancel without updating the court', () => {
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
    openUpdatePage().localAuthority().should('have.value', 'Sheffield')
  })

  it('will reject unselected free text and retain it for correction', () => {
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Not a real local authority')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyLocalAuthority.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Select a valid local authority from the suggestions')
    pageWithErrors.localAuthority().should('have.value', 'Not a real local authority')
    pageWithErrors.localAuthority().should('have.attr', 'aria-describedby').and('contain', 'localAuthority-error')
    updatedCourts().should('be.empty')
  })

  it('will invalidate the selected code when the description is edited', () => {
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Leeds')
    updatePage.suggestions().contains('Leeds').click()
    updatePage.localAuthority().type(' invalid')
    updatePage.saveButton().click()
    UpdateAgencyLocalAuthority.verifyOnPage(court.courtName)
      .error()
      .should('contain.text', 'Select a valid local authority from the suggestions')
    updatedCourts().should('be.empty')
  })

  it('will retain the selected local authority when the API rejects the update', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Local authority could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Leeds')
    updatePage.suggestions().contains('Leeds').click()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyLocalAuthority.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Local authority could not be updated')
    pageWithErrors.localAuthority().should('have.value', 'Leeds')
    pageWithErrors.code().should('have.value', 'LEED')
  })

  it('will show a search error and allow retrying', () => {
    cy.intercept('GET', '/api/search-local-authority?*', { statusCode: 503 }).as('failedSearch')
    const updatePage = openUpdatePage()
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Leeds')
    cy.wait('@failedSearch')
    updatePage.searchStatus().should('contain.text', 'Unable to load local authorities. Try searching again.')
    cy.intercept('GET', '/api/search-local-authority?*', { body: [localAuthorities[1]] }).as('search')
    updatePage.localAuthority().clear()
    updatePage.localAuthority().type('Leeds')
    cy.wait('@search')
    updatePage.suggestions().contains('Leeds').click()
    updatePage.searchStatus().should('be.empty')
    updatePage.code().should('have.value', 'LEED')
  })
})
