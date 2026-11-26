import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import { areas, localAuthorities, payrollRegions, regions } from '../mockApis/referenceData'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  cjitCode: 'C00MD00',
  area: areas[0],
  region: regions[0],
  geographicalArea: areas[1],
  localAuthority: localAuthorities[0],
  payrollRegion: payrollRegions[0],
})

const expectedUpdate = (cjitCode: string) => ({
  cjitCode,
  areaCode: areas[0].code,
  regionCode: regions[0].code,
  geographicalAreaCode: areas[1].code,
  localAuthorityCode: localAuthorities[0].code,
  payrollRegionCode: payrollRegions[0].code,
})

const updatedPrisonAreas = () => cy.task('getUpdatedPrisonAreas', prison.prisonId)
const openUpdatePage = () => {
  PrisonDetails.verifyOnPage(prison.prisonName).updateCjitCodeLink().click()
  return UpdateAgencyCjitCode.verifyOnPage(prison.prisonName)
}

context('Prison register - update CJIT code', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubUpdatePrisonArea', prison.prisonId)
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
  })

  it('will link to the update page and prefill the current code', () => {
    PrisonDetails.verifyOnPage(prison.prisonName)
      .updateCjitCodeLink()
      .should('have.attr', 'href', '/prison-register/cjit-code/update?id=MDI')
    const updatePage = openUpdatePage()
    updatePage.cjitCode().should('have.value', 'C00MD00')
    updatePage.cancelLink().should('have.attr', 'href', '/prison-register/details?id=MDI')
  })

  it('will cancel without updating the prison', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cancelLink().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisonAreas().should('be.empty')
  })

  it('will reject more than 7 characters, retain input and allow correction', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cjitCode().type('ABCDEFGHIJKLM')
    updatePage.saveButton().click()

    const pageWithErrors = UpdateAgencyCjitCode.verifyOnPage(prison.prisonName)
    pageWithErrors.error().should('contain.text', 'CJIT code must be 7 characters or fewer')
    pageWithErrors.cjitCode().should('have.value', 'ABCDEFGHIJKLM')
    updatedPrisonAreas().should('be.empty')

    pageWithErrors.cjitCode().clear()
    pageWithErrors.cjitCode().type('  ABCDEFG  ')
    pageWithErrors.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    cy.url().should('include', '/prison-register/details?id=MDI&action=UPDATED')
    updatedPrisonAreas().should('deep.equal', [expectedUpdate('ABCDEFG')])
  })

  it('will allow clearing the code', () => {
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.saveButton().click()
    PrisonDetails.verifyOnPage(prison.prisonName)
    updatedPrisonAreas().should('deep.equal', [expectedUpdate('')])
  })

  it('will display API errors and retain the submitted code', () => {
    cy.task('stubUpdatePrisonAreaError', { prisonId: prison.prisonId, userMessage: 'CJIT code could not be updated' })
    const updatePage = openUpdatePage()
    updatePage.cjitCode().clear()
    updatePage.cjitCode().type('NEWCODE')
    updatePage.saveButton().click()
    const pageWithErrors = UpdateAgencyCjitCode.verifyOnPage(prison.prisonName)
    pageWithErrors.error().should('contain.text', 'CJIT code could not be updated')
    pageWithErrors.cjitCode().should('have.value', 'NEWCODE')
  })
})
