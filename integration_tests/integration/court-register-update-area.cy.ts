import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
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
  area: areas[0],
})
const unchangedFields = {
  courtName: court.courtName,
  description: court.description,
  active: false,
  inactiveDate: court.inactiveDate,
  cjitCode: court.cjitCode,
  accessibleAccess: court.accessibleAccess,
  courtTypeCode: court.courtType.code,
  regionCode: court.region.code,
  geographicalAreaCode: court.geographicalArea.code,
  localAuthorityCode: court.localAuthority.code,
  payrollRegionCode: court.payrollRegion.code,
}
const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateAreaLink().click()
  return UpdateAgencyArea.verifyOnPage(court.courtName)
}

context('Court register - update area', () => {
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

  it('will prefill the current area description and code', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateAreaLink()
      .should('have.attr', 'href', '/court-register/area/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.area().should('have.value', `${areas[0].code} - ${areas[0].description}`)
  })

  it('will prefill an empty area when none is assigned', () => {
    cy.task('stubGetCourt', { ...court, area: null })
    const updatePage = openUpdatePage()
    updatePage.area().should('have.value', '')
  })

  it('will cancel without saving', () => {
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
  })

  it('will search descriptions case-insensitively and submit only the selected code', () => {
    cy.intercept('GET', '/api/search-area?*').as('search')
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('sOuTh')
    cy.wait('@search').its('response.body').should('deep.equal', areas.slice(1))
    updatePage.suggestions().should('have.length', 2)
    updatePage.suggestions().contains('SY - South Yorkshire').click()
    updatePage.area().should('have.value', 'SY - South Yorkshire')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    updatedCourts().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will preserve the current area when submitted unchanged', () => {
    openUpdatePage().saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, areaCode: 'YH' }])
  })

  it('will select an area using the keyboard', () => {
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('South')
    updatePage.suggestions().should('have.length', 2)
    updatePage.area().type('{downarrow}{enter}')
    updatePage.area().should('have.value', 'SY - South Yorkshire')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will clear an existing area', () => {
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [unchangedFields])
  })

  it('will reject unselected free text and retain it for correction', () => {
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('Not a real area')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyArea.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Select a valid area from the suggestions')
    pageWithErrors.area().should('have.value', 'Not a real area')
    updatedCourts().should('be.empty')
    pageWithErrors.area().clear()
    pageWithErrors.area().type('South')
    pageWithErrors.suggestions().contains('South West').click()
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, areaCode: 'SW' }])
  })

  it('will invalidate the selected code if the description is edited afterwards', () => {
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('South')
    updatePage.suggestions().contains('SY - South Yorkshire').click()
    updatePage.area().type(' invalid')
    updatePage.saveButton().click()
    UpdateAgencyArea.verifyOnPage(court.courtName).error().should('contain.text', 'Select a valid area')
    updatedCourts().should('be.empty')
  })

  it('will show API validation errors and retain a selected area for retry', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Area could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('South')
    updatePage.suggestions().contains('South Yorkshire').click()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyArea.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Area could not be updated')
    pageWithErrors.area().should('have.value', 'SY - South Yorkshire')
    cy.task('stubUpdateCourt', court.courtId)
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('have.length', 2)
  })

  it('will display a search failure and recover when searching again', () => {
    cy.intercept('GET', '/api/search-area?*', { statusCode: 503 }).as('searchFailure')
    const updatePage = openUpdatePage()
    updatePage.area().clear()
    updatePage.area().type('South')
    cy.wait('@searchFailure')
    cy.get('#area-search-status').should('contain.text', 'Unable to load areas')
    cy.intercept('GET', '/api/search-area?*', { body: areas.slice(1) })
    updatePage.area().clear()
    updatePage.area().type('South')
    updatePage.suggestions().should('have.length', 2)
  })
})
