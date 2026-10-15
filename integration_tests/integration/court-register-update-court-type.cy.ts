import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateCourtType from '../pages/court-register/updateCourtType'
import courtData from '../../server/routes/testutils/mockCourtData'

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

const expectedUpdate = (courtTypeCode: string) => ({
  courtName: 'Sheffield Crown Court',
  description: 'Sheffield Main Crown Court',
  active: true,
  cjitCode: 'C00SH00',
  accessibleAccess: 'ACCESSIBLE',
  areaCode: 'A1',
  regionCode: 'R1',
  geographicalAreaCode: 'G1',
  localAuthorityCode: 'L1',
  payrollRegionCode: 'P1',
  courtTypeCode,
})

const courtTypes = [
  ['CACD', 'Court of Appeal - Criminal Division'],
  ['CB', 'Combined Court'],
  ['CC', 'Crown Court'],
  ['CO', 'County Court'],
  ['DCM', 'District Court Marshal'],
  ['GCM', 'General Court Marshal'],
  ['IMM', 'Immigration Court'],
  ['MC', 'Magistrates Court'],
  ['OTHER', 'Courts Outside England and Wales'],
  ['YC', 'Youth Court'],
  ['UNK', 'Unknown'],
]

const updatedCourts = () => cy.task('getUpdatedCourts', sheffieldCrownCourt.courtId)

const openUpdatePage = () => {
  CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateCourtTypeLink().click()
  return UpdateCourtType.verifyOnPage(sheffieldCrownCourt.courtName)
}

context('Court register - update court type', () => {
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

  it('will show an update link for the court type', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .updateCourtTypeLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/court-type/update?id=SHFCC')
  })

  it('will display a radio button for every court type with the current type selected', () => {
    const updatePage = openUpdatePage()
    updatePage.caption().should('contain.text', 'Update court type')
    updatePage.courtTypes().should('have.length', courtTypes.length)
    courtTypes.forEach(([code, description]) => {
      updatePage.courtTypeLabel(code).should('contain.text', description)
    })
    updatePage.courtType('CC').should('be.checked')
    cy.get('input[name=courtType]:checked').should('have.length', 1)
    updatePage.saveButton().should('contain.text', 'Confirm and save')
    updatePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to the court details page when cancelled', () => {
    const updatePage = openUpdatePage()
    updatePage.courtType('MC').check()
    updatePage.cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedCourts().should('be.empty')
  })

  it('will require a court type to be selected', () => {
    cy.task('stubGetCourt', { ...sheffieldCrownCourt, courtType: null })
    cy.reload()
    const updatePage = openUpdatePage()
    cy.get('input[name=courtType]:checked').should('not.exist')
    updatePage.saveButton().click()

    const pageWithErrors = UpdateCourtType.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.errorSummary().should('contain.text', 'Select a court type')
    pageWithErrors.courtTypeError().should('contain.text', 'Select a court type')
    cy.url().should('include', '/court-register/court-type/update?id=SHFCC')
    updatedCourts().should('be.empty')
  })

  it('will reject a court type code that is not in the list', () => {
    const updatePage = openUpdatePage()
    updatePage.courtType('MC').invoke('attr', 'value', 'XX')
    updatePage.courtType('XX').check()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateCourtType.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.courtTypeError().should('contain.text', 'Select a valid court type')
    cy.get('input[name=courtType]:checked').should('not.exist')
    updatedCourts().should('be.empty')
  })

  it('will send all court fields with the selected court type', () => {
    const updatePage = openUpdatePage()
    updatePage.courtType('UNK').check()
    updatePage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    updatedCourts().should('deep.equal', [expectedUpdate('UNK')])
  })

  it('will show the API user message, retain the selection and allow a corrected submission', () => {
    cy.task('stubCourtMutationError', {
      courtId: sheffieldCrownCourt.courtId,
      endpoint: '',
      method: 'PUT',
      userMessage: 'Court type not allowed',
    })
    const updatePage = openUpdatePage()
    updatePage.courtType('YC').check()
    updatePage.saveButton().click()

    const pageWithErrors = UpdateCourtType.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.courtTypeError().should('contain.text', 'Court type not allowed')
    pageWithErrors.courtType('YC').should('be.checked')

    cy.task('stubUpdateCourt', sheffieldCrownCourt.courtId)
    pageWithErrors.courtType('MC').check()
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedCourts().should('have.deep.members', [expectedUpdate('YC'), expectedUpdate('MC')])
  })
})
