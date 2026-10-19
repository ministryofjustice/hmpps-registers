import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyGeographicalArea from '../pages/components/edit/updateAgencyGeographicalArea'
import courtData from '../../server/routes/testutils/mockCourtData'

const areas = [
  { code: 'YH', description: 'Yorkshire and the Humber' },
  { code: 'SY', description: 'South Yorkshire' },
  { code: 'SW', description: 'South West' },
]
const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  geographicalArea: areas[0],
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
  localAuthorityCode: court.localAuthority.code,
  payrollRegionCode: court.payrollRegion.code,
  courtTypeCode: court.courtType.code,
}
const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateGeographicalAreaLink().click()
  return UpdateAgencyGeographicalArea.verifyOnPage(court.courtName)
}

context('Court register - update geographical area', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court])
    cy.task('stubGetCourt', court)
    cy.task('stubUpdateCourt', court.courtId)
    cy.task('stubGetAreas', areas)
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(court.courtId).click()
  })

  it('will provide a link to update geographical area and prefill the current value', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateGeographicalAreaLink()
      .should('have.attr', 'href', '/court-register/geographical-area/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().should('have.value', areas[0].description)
    updatePage.code().should('have.value', 'YH')
  })

  it('will prefill an empty geographical area when none is assigned', () => {
    cy.task('stubGetCourt', { ...court, geographicalArea: null })
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().should('have.value', '')
    updatePage.code().should('have.value', '')
  })

  it('will search areas and submit the selected code while showing only its description', () => {
    cy.intercept('GET', '/api/search-area?*').as('search')
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('sOuTh')
    cy.wait('@search').its('response.body').should('deep.equal', areas.slice(1))
    updatePage.suggestions().should('contain.text', 'South Yorkshire')
    updatePage.suggestions().should('not.contain.text', 'SY')
    updatePage.suggestions().contains('South Yorkshire').click()
    updatePage.geographicalArea().should('have.value', 'South Yorkshire')
    updatePage.code().should('have.value', 'SY')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, geographicalAreaCode: 'SY' }])
  })

  it('will save an unchanged geographical area', () => {
    openUpdatePage().saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, geographicalAreaCode: 'YH' }])
  })

  it('will select a geographical area using the keyboard', () => {
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('South')
    updatePage.suggestions().should('have.length', 2)
    updatePage.geographicalArea().type('{downarrow}{enter}')
    updatePage.code().should('have.value', 'SY')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, geographicalAreaCode: 'SY' }])
  })

  it('will clear an existing geographical area', () => {
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [unchangedFields])
  })

  it('will cancel without updating the court', () => {
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
    openUpdatePage().geographicalArea().should('have.value', areas[0].description)
  })

  it('will reject unselected free text and retain it for correction', () => {
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('Not a real geographical area')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyGeographicalArea.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Select a valid geographical area from the suggestions')
    pageWithErrors.geographicalArea().should('have.value', 'Not a real geographical area')
    pageWithErrors.geographicalArea().should('have.attr', 'aria-describedby').and('contain', 'geographicalArea-error')
    updatedCourts().should('be.empty')
  })

  it('will invalidate the selected code when the description is edited', () => {
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('South')
    updatePage.suggestions().contains('South Yorkshire').click()
    updatePage.geographicalArea().type(' invalid')
    updatePage.saveButton().click()
    UpdateAgencyGeographicalArea.verifyOnPage(court.courtName)
      .error()
      .should('contain.text', 'Select a valid geographical area from the suggestions')
    updatedCourts().should('be.empty')
  })

  it('will retain the selected geographical area when the API rejects the update', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Geographical area could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('South')
    updatePage.suggestions().contains('South Yorkshire').click()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyGeographicalArea.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Geographical area could not be updated')
    pageWithErrors.geographicalArea().should('have.value', 'South Yorkshire')
    pageWithErrors.code().should('have.value', 'SY')
  })

  it('will show a search error and allow retrying', () => {
    cy.intercept('GET', '/api/search-area?*', { statusCode: 503 }).as('failedSearch')
    const updatePage = openUpdatePage()
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('South')
    cy.wait('@failedSearch')
    updatePage.searchStatus().should('contain.text', 'Unable to load geographical areas. Try searching again.')
    cy.intercept('GET', '/api/search-area?*', { body: [areas[1]] }).as('search')
    updatePage.geographicalArea().clear()
    updatePage.geographicalArea().type('South')
    cy.wait('@search')
    updatePage.suggestions().contains('South Yorkshire').click()
    updatePage.searchStatus().should('be.empty')
    updatePage.code().should('have.value', 'SY')
  })
})
