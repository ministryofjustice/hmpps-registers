import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import courtData from '../../server/routes/testutils/mockCourtData'
import UpdateAgencyNameDescription from '../pages/components/edit/updateAgencyNameDescription'

const sheffieldCrownCourt = courtData.court({
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

const expectedUpdate = (courtName: string, description: string) => ({
  courtName,
  description,
  active: true,
  cjitCode: 'C00SH00',
  accessibleAccess: 'ACCESSIBLE',
  areaCode: 'A1',
  regionCode: 'R1',
  geographicalAreaCode: 'G1',
  localAuthorityCode: 'L1',
  payrollRegionCode: 'P1',
  courtTypeCode: 'CC',
})

const updatedCourts = () => cy.task('getUpdatedCourts', sheffieldCrownCourt.courtId)

const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateNameLink().click()
  return UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName)
}

context('Court register - update court name and description', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubUpdateCourt', sheffieldCrownCourt.courtId)
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show update links for name and description that go to the same page', () => {
    const details = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    details
      .updateNameLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/name-description/update?id=SHFCC')
    details
      .updateDescriptionLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/name-description/update?id=SHFCC')
  })

  it('will navigate from the description link to the prefilled update page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateDescriptionLink().click()

    const updatePage = UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName)
    updatePage.caption().should('contain.text', 'Update name and description')
    updatePage.name().should('have.value', 'Sheffield Crown Court')
    updatePage.description().should('have.value', 'Sheffield Main Crown Court')
    updatePage.saveButton().should('contain.text', 'Confirm and save')
    updatePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to the court details page when cancelled', () => {
    openUpdatePage().cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedCourts().should('be.empty')
  })

  it('will require a name and a description', () => {
    const updatePage = openUpdatePage()
    updatePage.name().clear()
    updatePage.description().clear()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.errorSummary().should('contain.text', 'Enter a name').should('contain.text', 'Enter a description')
    pageWithErrors.nameError().should('contain.text', 'Enter a name')
    pageWithErrors.descriptionError().should('contain.text', 'Enter a description')
    pageWithErrors.name().should('have.value', '')
    pageWithErrors.description().should('have.value', '')
    cy.url().should('include', '/court-register/name-description/update?id=SHFCC')
    updatedCourts().should('be.empty')
  })

  it('will redisplay the submitted name when only the description is missing', () => {
    const updatePage = openUpdatePage()
    updatePage.name().clear()
    updatePage.name().type('Sheffield Combined Court')
    updatePage.description().clear()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.descriptionError().should('contain.text', 'Enter a description')
    pageWithErrors.nameError().should('not.exist')
    pageWithErrors.name().should('have.value', 'Sheffield Combined Court')
    updatedCourts().should('be.empty')
  })

  it('will reset to the current values on a fresh visit', () => {
    const updatePage = openUpdatePage()
    updatePage.name().clear()
    updatePage.saveButton().click()
    UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    const freshPage = openUpdatePage()
    freshPage.name().should('have.value', 'Sheffield Crown Court')
    freshPage.description().should('have.value', 'Sheffield Main Crown Court')
  })

  it('will trim and send all court fields with the new name and description', () => {
    const updatePage = openUpdatePage()
    updatePage.name().clear()
    updatePage.name().type('  Sheffield Combined Court  ')
    updatePage.description().clear()
    updatePage.description().type('  Sheffield Combined Crown Court  ')
    updatePage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    updatedCourts().should('deep.equal', [expectedUpdate('Sheffield Combined Court', 'Sheffield Combined Crown Court')])
  })

  it('will show the API user message, retain input and allow a corrected submission', () => {
    cy.task('stubCourtMutationError', {
      courtId: sheffieldCrownCourt.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Court name already in use',
    })
    const updatePage = openUpdatePage()
    updatePage.name().clear()
    updatePage.name().type('Duplicate Court')
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyNameDescription.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.nameError().should('contain.text', 'Court name already in use')
    pageWithErrors.name().should('have.value', 'Duplicate Court')
    pageWithErrors.description().should('have.value', 'Sheffield Main Crown Court')
    cy.url().should('include', '/court-register/name-description/update?id=SHFCC')

    cy.task('stubUpdateCourt', sheffieldCrownCourt.courtId)
    pageWithErrors.name().clear()
    pageWithErrors.name().type('Unique Court')
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedCourts().should('have.deep.members', [
      expectedUpdate('Duplicate Court', 'Sheffield Main Crown Court'),
      expectedUpdate('Unique Court', 'Sheffield Main Crown Court'),
    ])
  })
})
