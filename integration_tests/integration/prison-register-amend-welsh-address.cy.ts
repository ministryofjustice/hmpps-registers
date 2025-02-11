import IndexPage from '../pages'
import { cardiffPrisonWithWelshAddress } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AmendWelshPrisonAddressPage from '../pages/prison-register/amendWelshPrisonAddress'

context('Prison register - amend existing prison address', () => {
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

  describe('amending a Welsh prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage()
        .viewPrisonLink('CFI')
        .should('contain.text', cardiffPrisonWithWelshAddress.prisonName)
        .click()
    })
    it('should show summary of prison with link to amend', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.amendWelshAddressDetailsLink('16').should('contain.text', 'Change')
      prisonDetailsPage.deleteWelshAddressDetailsLink('16').should('contain.text', 'Delete')
    })
    it('can navigate to amend Welsh prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.amendWelshAddressDetailsLink('16').click()
      const amendWelshPrisonAddressPage = AmendWelshPrisonAddressPage.verifyOnPage('CFI')

      amendWelshPrisonAddressPage
        .addressLine1()
        .should('have.value', cardiffPrisonWithWelshAddress.addresses[0].addressLine1InWelsh)
      amendWelshPrisonAddressPage.saveButton()
    })
    it('will validate prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.amendWelshAddressDetailsLink('16').click()
      const amendWelshPrisonAddressPage = AmendWelshPrisonAddressPage.verifyOnPage('CFI')

      amendWelshPrisonAddressPage.addressTown().clear().type('  ')
      amendWelshPrisonAddressPage.saveButton().click()
      amendWelshPrisonAddressPage.errorSummary().contains('Enter the town or city')
    })
    it('will return to prison details page with success message after saving', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
      prisonDetailsPage.amendWelshAddressDetailsLink('16').click()
      const amendWelshPrisonAddressPage = AmendWelshPrisonAddressPage.verifyOnPage('CFI')

      amendWelshPrisonAddressPage.addressTown().clear().type('Caerdydd')
      amendWelshPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(cardiffPrisonWithWelshAddress.prisonName)
        .prisonUpdatedConfirmationBlock()
        .should('exist')
    })
  })
})
