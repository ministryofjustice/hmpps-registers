import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyActive from '../pages/components/edit/updateAgencyActive'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  description: 'Sheffield Main Crown Court',
  cjitCode: 'C00SH00',
  accessibleAccess: 'ACCESSIBLE',
  courtType: { code: 'CC', description: 'Crown Court' },
  area: { code: 'A1', description: 'Area' },
  region: { code: 'R1', description: 'Region' },
  geographicalArea: { code: 'G1', description: 'Geographical area' },
  localAuthority: { code: 'L1', description: 'Local authority' },
  payrollRegion: { code: 'P1', description: 'Payroll region' },
})

const unchangedFields = {
  courtName: court.courtName,
  description: court.description,
  cjitCode: court.cjitCode,
  accessibleAccess: court.accessibleAccess,
  courtTypeCode: 'CC',
  areaCode: 'A1',
  regionCode: 'R1',
  geographicalAreaCode: 'G1',
  localAuthorityCode: 'L1',
  payrollRegionCode: 'P1',
}

const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateActiveLink().click()
  return UpdateAgencyActive.verifyOnPage(court.courtName)
}

context('Court register - update active status', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court])
    cy.task('stubGetCourt', court)
    cy.task('stubUpdateCourt', court.courtId)
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(court.courtId).click()
  })

  it('will link both status and deactivation date to the same prefilled page', () => {
    const details = CourtsDetails.verifyOnPage(court.courtName)
    details.updateActiveLink().should('have.attr', 'href', '/court-register/active/update?id=SHFCC')
    details.updateInactiveDateLink().should('have.attr', 'href', '/court-register/active/update?id=SHFCC').click()
    const updatePage = UpdateAgencyActive.verifyOnPage(court.courtName)
    updatePage.inactive().should('be.checked')
    updatePage.date().should('be.visible')
    updatePage.day().should('have.value', '31')
    updatePage.month().should('have.value', '1')
    updatePage.year().should('have.value', '2024')
  })

  it('will reveal and hide the date fields as the radio selection changes', () => {
    const updatePage = openUpdatePage()
    updatePage.active().check()
    updatePage.date().should('not.be.visible')
    updatePage.inactive().check()
    updatePage.date().should('be.visible')
    updatePage.day().should('have.value', '31')
  })

  it('will default the deactivation date to today when it is not provided', () => {
    const before = new Date()
    cy.task('stubGetCourt', { ...court, active: true, inactiveDate: null })
    const updatePage = openUpdatePage()
    updatePage.active().should('be.checked')
    updatePage.date().should('not.be.visible')
    updatePage.inactive().check()
    updatePage.day().should('have.value', String(before.getDate()))
    updatePage.month().should('have.value', String(before.getMonth() + 1))
    updatePage.year().should('have.value', String(before.getFullYear()))
  })

  it('will cancel without calling the update endpoint', () => {
    const updatePage = openUpdatePage()
    updatePage.active().check()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
  })

  it('will require a valid status', () => {
    const updatePage = openUpdatePage()
    updatePage.active().invoke('attr', 'value', 'invalid')
    cy.get('input[name=active][value=invalid]').check()
    updatePage.saveButton().click()
    UpdateAgencyActive.verifyOnPage(court.courtName).statusError().should('contain.text', 'Select active or inactive')
    updatedCourts().should('be.empty')
  })

  it('will require all date fields when inactive and retain cleared values', () => {
    const updatePage = openUpdatePage()
    updatePage.day().clear()
    updatePage.month().clear()
    updatePage.year().clear()
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyActive.verifyOnPage(court.courtName)
    pageWithErrors.dateError().should('contain.text', 'Enter the date deactivated, including a day, month and year')
    pageWithErrors.inactive().should('be.checked')
    pageWithErrors.date().should('be.visible')
    pageWithErrors.day().should('have.value', '')
    pageWithErrors.month().should('have.value', '')
    pageWithErrors.year().should('have.value', '')
    updatedCourts().should('be.empty')
  })

  it('will reject an impossible date and save a corrected leap day', () => {
    const updatePage = openUpdatePage()
    updatePage.day().clear()
    updatePage.day().type('30')
    updatePage.month().clear()
    updatePage.month().type('2')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyActive.verifyOnPage(court.courtName)
    pageWithErrors.dateError().should('contain.text', 'Date deactivated must be a real date')
    pageWithErrors.day().should('have.value', '30')
    updatedCourts().should('be.empty')

    pageWithErrors.day().clear()
    pageWithErrors.day().type('29')
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, active: false, inactiveDate: '2024-02-29' }])
  })

  it('will reactivate the court and omit the previous inactive date even if submitted fields are invalid', () => {
    const updatePage = openUpdatePage()
    updatePage.year().clear()
    updatePage.year().type('invalid')
    updatePage.active().check()
    updatePage.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    updatedCourts().should('deep.equal', [{ ...unchangedFields, active: true }])
  })

  it('will deactivate an active court and display the new date on the details page', () => {
    cy.task('stubGetCourt', { ...court, active: true, inactiveDate: null })
    const updatePage = openUpdatePage()
    updatePage.inactive().check()
    updatePage.day().clear()
    updatePage.day().type('12')
    updatePage.month().clear()
    updatePage.month().type('10')
    updatePage.year().clear()
    updatePage.year().type('2025')
    cy.task('stubGetCourt', { ...court, active: false, inactiveDate: '2025-10-12' })
    updatePage.saveButton().click()
    const details = CourtsDetails.verifyOnPage(court.courtName)
    details.active().should('contain.text', 'Inactive')
    details.inactiveDate().should('contain.text', '12 October 2025')
    updatedCourts().should('deep.equal', [{ ...unchangedFields, active: false, inactiveDate: '2025-10-12' }])
  })

  it('will retain the status and date after API rejection and allow retry', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Court status could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.day().clear()
    updatePage.day().type('15')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyActive.verifyOnPage(court.courtName)
    pageWithErrors.statusError().should('contain.text', 'Court status could not be updated')
    pageWithErrors.inactive().should('be.checked')
    pageWithErrors.day().should('have.value', '15')
    cy.task('stubUpdateCourt', court.courtId)
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('have.length', 2)
  })

  it('will capture the inactive update view and court details for review', () => {
    cy.viewport(1280, 1100)
    cy.screenshot('court-details-active-status', { capture: 'fullPage' })
    openUpdatePage()
    cy.screenshot('update-agency-active-inactive', { capture: 'fullPage' })
    UpdateAgencyActive.verifyOnPage(court.courtName).active().check()
    cy.screenshot('update-agency-active', { capture: 'fullPage' })
  })
})
