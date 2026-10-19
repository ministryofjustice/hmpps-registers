import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyRegion from '../pages/components/edit/updateAgencyRegion'
import courtData from '../../server/routes/testutils/mockCourtData'

const regions = [
  { code: 'YH', description: 'Yorkshire and the Humber' },
  { code: 'NE', description: 'North East' },
  { code: 'SW', description: 'South West' },
]
const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  region: regions[0],
})
const unchangedFields = {
  courtName: court.courtName,
  description: court.description,
  active: court.active,
  inactiveDate: court.inactiveDate,
  cjitCode: court.cjitCode,
  accessibleAccess: court.accessibleAccess,
  areaCode: court.area.code,
  geographicalAreaCode: court.geographicalArea.code,
  localAuthorityCode: court.localAuthority.code,
  payrollRegionCode: court.payrollRegion.code,
  courtTypeCode: court.courtType.code,
}
const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateRegionLink().click()
  return UpdateAgencyRegion.verifyOnPage(court.courtName)
}

context('Court register - update region', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court])
    cy.task('stubGetCourt', court)
    cy.task('stubUpdateCourt', court.courtId)
    cy.task('stubGetRegions', regions)
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(court.courtId).click()
  })

  it('will provide a link to update region and prefill the current value', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateRegionLink()
      .should('have.attr', 'href', '/court-register/region/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.region().should('have.value', regions[0].description)
    updatePage.code().should('have.value', 'YH')
  })

  it('will prefill an empty region when none is assigned', () => {
    cy.task('stubGetCourt', { ...court, region: null })
    const updatePage = openUpdatePage()
    updatePage.region().should('have.value', '')
    updatePage.code().should('have.value', '')
  })

  it('will search regions and submit the selected code while showing only its description', () => {
    cy.intercept('GET', '/api/search-region?*').as('search')
    const updatePage = openUpdatePage()
    updatePage.region().clear()
    updatePage.region().type('nOrTh')
    cy.wait('@search').its('response.body').should('deep.equal', regions.slice(1, 2))
    updatePage.suggestions().should('contain.text', 'North East')
    updatePage.suggestions().should('not.contain.text', 'NE')
    updatePage.suggestions().contains('North East').click()
    updatePage.region().should('have.value', 'North East')
    updatePage.code().should('have.value', 'NE')
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, regionCode: 'NE' }])
  })

  it('will clear an existing region', () => {
    const updatePage = openUpdatePage()
    updatePage.region().clear()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [unchangedFields])
  })

  it('will reject unselected free text and retain it for correction', () => {
    const updatePage = openUpdatePage()
    updatePage.region().clear()
    updatePage.region().type('Not a real region')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyRegion.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Select a valid region from the suggestions')
    pageWithErrors.region().should('have.value', 'Not a real region')
    updatedCourts().should('be.empty')
  })

  it('will retain the selected region when the API rejects the update', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Region could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.region().clear()
    updatePage.region().type('North')
    updatePage.suggestions().contains('North East').click()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyRegion.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Region could not be updated')
    pageWithErrors.region().should('have.value', 'North East')
    pageWithErrors.code().should('have.value', 'NE')
  })
})
