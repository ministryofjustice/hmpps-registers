import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetails from '../pages/prison-register/prisonDetails'
import UpdatePrisonDetail from '../pages/prison-register/updatePrisonDetail'
import prisonData from '../../server/routes/testutils/mockPrisonData'

const prison = prisonData.prisonDetails({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  description: 'A category C training prison in South Yorkshire',
  active: true,
  male: true,
  female: false,
  contracted: false,
  lthse: false,
  operators: [],
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
    details.prisonDetailsSection().should('contain.text', 'A category C training prison')
    details.prisonDetailsSection().screenshot('prison-details-card-description')
    details.updateDescriptionLink().click()
    UpdatePrisonDetail.verifyOnPage('Update description for HMP Moorland').description().should('be.visible')
    cy.screenshot('update-description-page', { capture: 'viewport' })
  })
})
