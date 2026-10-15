import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAccessibleAccess from '../pages/court-register/updateAccessibleAccess'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  description: 'Sheffield Main Crown Court',
  active: true,
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
  active: true,
  cjitCode: 'C00SH00',
  areaCode: 'A1',
  regionCode: 'R1',
  geographicalAreaCode: 'G1',
  localAuthorityCode: 'L1',
  payrollRegionCode: 'P1',
  courtTypeCode: 'CC',
}

const options = [
  ['NONE', 'No accessible access'],
  ['ACCESSIBLE', 'Yes, access is accessible'],
  ['BY_ARRANGEMENT_ONLY', 'Yes, but by arrangement only'],
  ['WHEELCHAIR_ACCESS', 'Has wheelchair access'],
  ['UNKNOWN', "Don't know"],
]

const updatedCourts = () => cy.task('getUpdatedCourts', court.courtId)

const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(court.courtName).updateAccessibleAccessLink().click()
  return UpdateAccessibleAccess.verifyOnPage(court.courtName)
}

context('Court register - update accessible access', () => {
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

  it('will show an update link and all five options with the current value selected', () => {
    CourtsDetails.verifyOnPage(court.courtName)
      .updateAccessibleAccessLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/accessible-access/update?id=SHFCC')

    const updatePage = openUpdatePage()
    updatePage.caption().should('contain.text', 'Update accessible access')
    updatePage.options().should('have.length', options.length)
    options.forEach(([value, label]) => updatePage.optionLabel(value).should('contain.text', label))
    updatePage.option('ACCESSIBLE').should('be.checked')
    updatePage.saveButton().should('contain.text', 'Confirm and save')
    updatePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will cancel without changing the court', () => {
    const updatePage = openUpdatePage()
    updatePage.option('NONE').check()
    updatePage.cancelLink().click()

    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('be.empty')
  })

  it("will select Don't know when the current value is null", () => {
    cy.task('stubGetCourt', { ...court, accessibleAccess: null })
    openUpdatePage().option('UNKNOWN').should('be.checked')
  })

  it('will require a selection and allow correction', () => {
    const updatePage = openUpdatePage()
    updatePage.options().invoke('prop', 'checked', false)
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAccessibleAccess.verifyOnPage(court.courtName)
    pageWithErrors.errorSummary().should('contain.text', 'Select an accessible access option')
    pageWithErrors.error().should('contain.text', 'Select an accessible access option')
    cy.get('input[name=accessibleAccess]:checked').should('not.exist')
    updatedCourts().should('be.empty')

    pageWithErrors.option('NONE').check()
    pageWithErrors.saveButton().click()
    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('deep.equal', [{ ...unchangedFields, accessibleAccess: 'NONE' }])
  })

  it('will reject an invalid accessible access code without calling the update endpoint', () => {
    const updatePage = openUpdatePage()
    updatePage.option('NONE').invoke('attr', 'value', 'INVALID')
    updatePage.option('INVALID').check()
    updatePage.saveButton().click()

    UpdateAccessibleAccess.verifyOnPage(court.courtName)
      .error()
      .should('contain.text', 'Select a valid accessible access option')
    updatedCourts().should('be.empty')
  })

  options.forEach(([value, label]) => {
    it(`will save "${label}" and preserve the other court details`, () => {
      const updatePage = openUpdatePage()
      updatePage.option(value).check()
      updatePage.saveButton().click()

      CourtsDetails.verifyOnPage(court.courtName)
      cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
      cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
      updatedCourts().should('deep.equal', [
        value === 'UNKNOWN' ? unchangedFields : { ...unchangedFields, accessibleAccess: value },
      ])
    })
  })

  it('will show API validation errors, retain the selection and allow retry', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Accessible access could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.option('UNKNOWN').check()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAccessibleAccess.verifyOnPage(court.courtName)
    pageWithErrors.error().should('contain.text', 'Accessible access could not be updated')
    pageWithErrors.option('UNKNOWN').should('be.checked')

    cy.task('stubUpdateCourt', court.courtId)
    pageWithErrors.option('WHEELCHAIR_ACCESS').check()
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(court.courtName)
    updatedCourts().should('have.deep.members', [
      unchangedFields,
      { ...unchangedFields, accessibleAccess: 'WHEELCHAIR_ACCESS' },
    ])
  })

  it('will reset to the current API value on a fresh visit', () => {
    cy.task('stubCourtMutationError', {
      courtId: court.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Accessible access could not be updated',
    })
    const updatePage = openUpdatePage()
    updatePage.option('NONE').check()
    updatePage.saveButton().click()
    UpdateAccessibleAccess.verifyOnPage(court.courtName).cancelLink().click()

    openUpdatePage().option('ACCESSIBLE').should('be.checked')
  })

  it('will capture the update view and court details for review', () => {
    cy.viewport(1280, 1100)
    cy.screenshot('court-details-accessible-access', { capture: 'fullPage' })
    openUpdatePage()
    cy.screenshot('update-court-accessible-access', { capture: 'fullPage' })
  })
})
