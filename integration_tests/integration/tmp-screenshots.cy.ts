import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import UpdatePrisonDetail from '../pages/prison-register/updatePrisonDetail'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  active: true,
  male: false,
  female: true,
  contracted: true,
  lthse: false,
  types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
  operators: [{ name: 'G4S' }],
})

context('temporary screenshots', () => {
  it('captures', () => {
    cy.viewport(1280, 1000)
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [prison])
    cy.task('stubGetPrison', prison)
    cy.task('stubGetPrisonDetails', prison)
    cy.task('stubUpdatePrison', prison)
    cy.signIn()
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    AllPrisons.verifyOnPage().viewPrisonLink(prison.prisonId).click()
    const details = PrisonDetails.verifyOnPage(prison.prisonName)
    details.prisonDetailsSection().should('contain.text', 'Not provided')
    details.prisonDetailsSection().screenshot('prison-details-card')
    details.updateWelshNameLink().click()
    UpdatePrisonDetail.verifyOnPage('Update Welsh name for HMP Moorland').welshName().should('be.visible')
    cy.screenshot('update-welsh-name-page', { capture: 'viewport' })
  })
})
