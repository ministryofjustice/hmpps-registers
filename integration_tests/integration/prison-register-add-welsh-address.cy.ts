import IndexPage from '../pages'
import { cardiffPrison } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AddWelshPrisonAddressPage from '../pages/prison-register/addWelshPrisonAddress'

context('Prison register - add address to existing prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [cardiffPrison])
    cy.task('stubGetPrison', cardiffPrison)
    cy.task('stubGetWelshPrisonAddress', { prisonId: 'CFI', addressId: '16' })
    cy.signIn()
  })

  describe('adding a Welsh prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink('CFI').should('contain.text', cardiffPrison.prisonName).click()
    })

    it('should show summary of prison with links', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', cardiffPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('CFI').should('contain.text', 'Add another address')
      prisonDetailsPage.addWelshAddressLink('16').should('contain.text', 'Add Welsh address')
    })

    it('can navigate to add prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName)
      prisonDetailsPage.addWelshAddressLink('16').click()
      const addPrisonAddressPage = AddWelshPrisonAddressPage.verifyOnPage('CFI')
      addPrisonAddressPage.saveButton()
    })

    it('will validate add prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName)
      prisonDetailsPage.addWelshAddressLink('16').click()
      const addWelshPrisonAddressPage = AddWelshPrisonAddressPage.verifyOnPage('CFI')
      addWelshPrisonAddressPage.townInWelsh().clear().type('  ')
      addWelshPrisonAddressPage.saveButton().click()

      const prisonDetailsWithErrors = AddWelshPrisonAddressPage.verifyOnPage('CFI')
      prisonDetailsWithErrors.errorSummary().contains('Enter the town or city')
    })

    it('will return to prison details page confirming update', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName)
      prisonDetailsPage.addWelshAddressLink('16').click()
      const addWelshPrisonAddressPage = AddWelshPrisonAddressPage.verifyOnPage('CFI')
      addWelshPrisonAddressPage.addressLine1InWelsh().type('Heol Knox')
      addWelshPrisonAddressPage.addressLine2InWelsh().type('Hollybush')
      addWelshPrisonAddressPage.townInWelsh().type('Caerdydd')
      addWelshPrisonAddressPage.countyInWelsh().type('Glamorgan')
      addWelshPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })

    it('will accept new address with minimal data', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName)
      prisonDetailsPage.addWelshAddressLink('16').click()
      const addWelshPrisonAddressPage = AddWelshPrisonAddressPage.verifyOnPage('CFI')
      addWelshPrisonAddressPage.townInWelsh().type('Caerdydd')
      addWelshPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(cardiffPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })
})
