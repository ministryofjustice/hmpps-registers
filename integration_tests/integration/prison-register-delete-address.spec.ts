import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import DeletePrisonAddressPage from '../pages/prison-register/deletePrisonAddress'

context('Prison register - delete prison address', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison, active: false }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrisonAddress')
    cy.task('stubDeletePrisonAddress')
    cy.signIn()
  })

  describe('deleting a prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
    })
    it('should show summary of prison with link to delete', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonName)
      prisonDetailsPage.deletePrisonAddressLink('21').should('contain.text', 'Delete')
    })
    it('can navigate to confirm prison address delete page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.deletePrisonAddressLink('21').click()
      const deletePrisonAddressPage = DeletePrisonAddressPage.verifyOnPage('MDI')
      deletePrisonAddressPage.deleteAddressButton()
    })
    it('will return to prison details page after confirming address delete', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.deletePrisonAddressLink('21').click()
      const deletePrisonAddressPage = DeletePrisonAddressPage.verifyOnPage('MDI')

      deletePrisonAddressPage.deleteAddressButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })
})
