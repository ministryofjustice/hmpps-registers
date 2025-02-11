import IndexPage from '../pages'
import { cardiffPrisonWithWelshAddress } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import DeleteWelshPrisonAddressPage from '../pages/prison-register/deleteWelshPrisonAddress'

context('Prison register - delete prison Welsh address', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [cardiffPrisonWithWelshAddress])
    cy.task('stubGetPrison', cardiffPrisonWithWelshAddress)
    cy.task('stubGetPrisonAddress', cardiffPrisonWithWelshAddress.addresses[0])
    cy.task('stubPutWelshPrisonAddress', { prisonId: 'CFI', addressId: '16' })
    cy.signIn()
  })

  describe('deleting a prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage()
        .viewPrisonLink('CFI')
        .should('contain.text', cardiffPrisonWithWelshAddress.prisonName)
        .click()
    })
    it('should show summary of prison with link to delete', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.deleteWelshAddressDetailsLink('16').should('contain.text', 'Delete')
    })
    it('can navigate to confirm prison address delete page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.deleteWelshAddressDetailsLink('16').click()
      const deleteWelshPrisonAddressPage = DeleteWelshPrisonAddressPage.verifyOnPage('CFI')
      deleteWelshPrisonAddressPage.deleteAddressButton()
    })
    it('will return to prison details page after confirming Welsh address delete', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.deleteWelshAddressDetailsLink('16').click()
      const deleteWelshPrisonAddressPage = DeleteWelshPrisonAddressPage.verifyOnPage('CFI')
      deleteWelshPrisonAddressPage.deleteAddressButton().click()
      PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
        .prisonUpdatedConfirmationBlock()
        .should('exist')
    })
  })
})
