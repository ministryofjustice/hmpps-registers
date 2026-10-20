import { payrollRegions } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyPayrollRegion from '../pages/components/edit/updateAgencyPayrollRegion'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  payrollRegion: payrollRegions[0],
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
  localAuthorityCode: court.localAuthority.code,
  courtTypeCode: court.courtType.code,
}
const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updatePayrollRegionLink().click()
  return UpdateAgencyPayrollRegion.verifyOnPage(court.courtName)
}

context('Court register - update payroll region', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court])
    cy.task('stubGetCourt', court)
    cy.task('stubUpdateCourt', court.courtId)
    cy.task('stubGetPayrollRegions', payrollRegions)
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(court.courtId).click()
  })

  it('will provide a link to update payroll region and prefill the current value', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updatePayrollRegionLink()
      .should('have.attr', 'href', '/court-register/payroll-region/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().should('have.value', payrollRegions[0].description)
    updatePage.code().should('have.value', 'YH')
  })

  it('will prefill an empty payroll region when none is assigned', () => {
    cy.task('stubGetCourt', { ...court, payrollRegion: null })
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().should('have.value', '')
    updatePage.code().should('have.value', '')
  })

  it('will search payroll regions and submit the selected code while showing only its description', () => {
    cy.intercept('GET', '/api/search-payroll-region?*').as('search')
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('nOrTh')
    cy.wait('@search').its('response.body').should('deep.equal', [payrollRegions[1]])
    updatePage.suggestions().should('contain.text', 'North East')
    updatePage.suggestions().should('not.contain.text', 'NE')
    updatePage.suggestions().contains('North East').click()
    updatePage.payrollRegion().should('have.value', 'North East')
    updatePage.code().should('have.value', 'NE')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, payrollRegionCode: 'NE' }])
  })

  it('will save an unchanged payroll region', () => {
    openUpdatePage().saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, payrollRegionCode: 'YH' }])
  })

  it('will select a payroll region using the keyboard', () => {
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('North')
    updatePage.suggestions().should('have.length', 1).and('contain.text', 'North East')
    updatePage.payrollRegion().type('{downarrow}{enter}')
    updatePage.code().should('have.value', 'NE')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, payrollRegionCode: 'NE' }])
  })

  it('will clear an existing payroll region', () => {
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [unchangedFields])
  })

  it('will cancel without updating the court', () => {
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
    openUpdatePage().payrollRegion().should('have.value', payrollRegions[0].description)
  })

  it('will reject unselected free text and retain it for correction', () => {
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('Not a real payroll region')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyPayrollRegion.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Select a valid payroll region from the suggestions')
    pageWithErrors.payrollRegion().should('have.value', 'Not a real payroll region')
    pageWithErrors.payrollRegion().should('have.attr', 'aria-describedby').and('contain', 'payrollRegion-error')
    updatedCourts().should('be.empty')
  })

  it('will invalidate the selected code when the description is edited', () => {
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('North')
    updatePage.suggestions().contains('North East').click()
    updatePage.payrollRegion().type(' invalid')
    updatePage.saveButton().click()
    UpdateAgencyPayrollRegion.verifyOnPage(court.courtName)
      .error()
      .should('contain.text', 'Select a valid payroll region from the suggestions')
    updatedCourts().should('be.empty')
  })

  it('will retain the selected payroll region when the API rejects the update', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Payroll region could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('North')
    updatePage.suggestions().contains('North East').click()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyPayrollRegion.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Payroll region could not be updated')
    pageWithErrors.payrollRegion().should('have.value', 'North East')
    pageWithErrors.code().should('have.value', 'NE')
  })

  it('will show a search error and allow retrying', () => {
    cy.intercept('GET', '/api/search-payroll-region?*', { statusCode: 503 }).as('failedSearch')
    const updatePage = openUpdatePage()
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('North')
    cy.wait('@failedSearch')
    updatePage.searchStatus().should('contain.text', 'Unable to load payroll regions. Try searching again.')
    cy.intercept('GET', '/api/search-payroll-region?*', { body: [payrollRegions[1]] }).as('search')
    updatePage.payrollRegion().clear()
    updatePage.payrollRegion().type('North')
    cy.wait('@search')
    updatePage.suggestions().contains('North East').click()
    updatePage.searchStatus().should('be.empty')
    updatePage.code().should('have.value', 'NE')
  })
})
