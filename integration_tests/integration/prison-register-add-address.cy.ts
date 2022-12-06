import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AddPrisonAddressPage from '../pages/prison-register/addPrisonAddress'

context('Prison register - add address to existing prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison, active: false }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrisonAddress')
    cy.task('stubAddPrisonAddress')
    cy.signIn()
  })

  describe('adding a prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
    })
    it('should show summary of prison with link to add', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('MDI').should('contain.text', 'Add another address')
    })
    it('can navigate to add prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('MDI').click()
      const addPrisonAddressPage = AddPrisonAddressPage.verifyOnPage('MDI')
      addPrisonAddressPage.saveButton()
    })
    it('will validate add prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('MDI').click()
      const addPrisonAddressPage = AddPrisonAddressPage.verifyOnPage('MDI')

      addPrisonAddressPage.addressTown().clear().type('  ')
      addPrisonAddressPage.saveButton().click()

      const prisonDetailsWithErrors = AddPrisonAddressPage.verifyOnPage('MDI')
      prisonDetailsWithErrors.errorSummary().contains('Enter the town or city')
    })
    it('will return to prison details page confirming update', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('MDI').click()
      const addPrisonAddressPage = AddPrisonAddressPage.verifyOnPage('MDI')

      addPrisonAddressPage.addressLine1().type('Vulcan way')
      addPrisonAddressPage.addressLine2().type('Hatfield Woodhouse')
      addPrisonAddressPage.addressTown().type('Doncaster')
      addPrisonAddressPage.addressCounty().type('South Yorkshire')
      addPrisonAddressPage.addressPostcode().type('DN7 6BB')
      addPrisonAddressPage.addressCountry().check('England')

      addPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
    it('will accept new address with minimal data', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.addPrisonAddressLink('MDI').click()
      const addPrisonAddressPage = AddPrisonAddressPage.verifyOnPage('MDI')

      addPrisonAddressPage.addressTown().type('Doncaster')
      addPrisonAddressPage.addressPostcode().type('DN7 6BB')
      addPrisonAddressPage.addressCountry().check('England')

      addPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })
})
