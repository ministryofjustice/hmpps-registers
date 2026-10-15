import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  description: 'Sheffield Main Crown Court',
  active: false,
  inactiveDate: '2024-01-31',
  cjitCode: 'C00SH00',
  accessibleAccess: 'ACCESSIBLE',
  courtType: { code: 'CC', description: 'Crown Court' },
  area: { code: 'A1', description: 'Area' },
  region: { code: 'R1', description: 'Region' },
  geographicalArea: { code: 'G1', description: 'Geographical area' },
  localAuthority: { code: 'L1', description: 'Local authority' },
  payrollRegion: { code: 'P1', description: 'Payroll region' },
})

const expectedUpdate = (cjitCode: string) => ({
  courtName: court.courtName,
  description: court.description,
  active: false,
  inactiveDate: '2024-01-31',
  cjitCode,
  accessibleAccess: 'ACCESSIBLE',
  courtTypeCode: 'CC',
  areaCode: 'A1',
  regionCode: 'R1',
  geographicalAreaCode: 'G1',
  localAuthorityCode: 'L1',
  payrollRegionCode: 'P1',
})

const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)
const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateCjitCodeLink().click()
  return UpdateAgencyCjitCode.verifyOnPage(court.courtName)
}

context('Court register - update CJIT code', () => {
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

  it('will show the update link and prefill the current code', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateCjitCodeLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/cjit-code/update?id=SHFCC')
    const updatePage = openUpdatePage()
    updatePage.cjitCode().should('have.value', 'C00SH00')
    updatePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will cancel without updating the court', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cancelLink().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
  })

  it('will prefill an empty input when the court has no code', () => {
    cy.task('stubGetCourt', { ...court, cjitCode: null })
    openUpdatePage().cjitCode().should('have.value', '')
  })

  it('will reject more than 12 characters, retain input and allow correction', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cjitCode().type('ABCDEFGHIJKLM')
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyCjitCode.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'CJIT code must be 12 characters or fewer')
    pageWithErrors.errorSummary().should('contain.text', 'CJIT code must be 12 characters or fewer')
    pageWithErrors.cjitCode().should('have.value', 'ABCDEFGHIJKLM')
    updatedCourts().should('be.empty')

    pageWithErrors.cjitCode().clear()
    pageWithErrors.cjitCode().type('  ABCDEFGHIJKL  ')
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    updatedCourts().should('deep.equal', [expectedUpdate('ABCDEFGHIJKL')])
  })

  ;['', '   '].forEach(value => {
    it(`will allow clearing the code with ${value ? 'whitespace' : 'an empty value'}`, () => {
      const updatePage = openUpdatePage()
      updatePage.cjitCode().clear()
      if (value) updatePage.cjitCode().type(value)
      updatePage.saveButton().click()
      CourtsDetails.verifyOnPage(court.courtName)
      updatedCourts().should('deep.equal', [expectedUpdate('')])
    })
  })

  it('will display API errors and retain an empty submitted code for retry', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'CJIT code could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyCjitCode.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'CJIT code could not be updated')
    pageWithErrors.cjitCode().should('have.value', '')
    cy.task('stubUpdateCourt', court.courtId)
    pageWithErrors.cjitCode().type('NEW-CODE')
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('have.deep.members', [expectedUpdate(''), expectedUpdate('NEW-CODE')])
  })

  it('will reset to the current code on a fresh visit', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cjitCode().type('ABCDEFGHIJKLM')
    updatePage.saveButton().click()
    UpdateAgencyCjitCode.verifyOnPage(court.courtName).cancelLink().click()
    openUpdatePage().cjitCode().should('have.value', 'C00SH00')
  })

  it('will capture the CJIT update page and court details for review', () => {
    cy.viewport(1280, 1100)
    cy.screenshot('court-details-cjit-code', { capture: 'fullPage' })
    openUpdatePage()
    cy.screenshot('update-agency-cjit-code', { capture: 'fullPage' })
  })
})
