import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AmendPrisonAddressPage from '../pages/prison-register/amendPrisonAddress'

context('Prison register - amend existing prison address', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison, active: false }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrisonAddress')
    cy.task('stubUpdatePrisonAddress')
    cy.signIn()
  })

  describe('amending a prison address', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
    })
    it('should show summary of prison with link to amend', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonName)
      prisonDetailsPage.amendAddressDetailsLink('21').should('contain.text', 'Change')
    })
    it('can navigate to amend prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendAddressDetailsLink('21').click()
      const amendPrisonAddressPage = AmendPrisonAddressPage.verifyOnPage('MDI')

      amendPrisonAddressPage.addressLine1().should('have.value', moorlandPrison.addresses[0].addressLine1)
      amendPrisonAddressPage.saveButton()
    })
    it('will validate prison address page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendAddressDetailsLink('21').click()
      const amendPrisonAddressPage = AmendPrisonAddressPage.verifyOnPage('MDI')

      amendPrisonAddressPage.addressTown().clear().type('  ')
      amendPrisonAddressPage.saveButton().click()

      const prisonDetailsWithErrors = AmendPrisonAddressPage.verifyOnPage('MDI')
      prisonDetailsWithErrors.errorSummary().contains('Enter the town or city')
    })
    it('will return to prison details page with success message after saving', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendAddressDetailsLink('21').click()
      const amendPrisonAddressPage = AmendPrisonAddressPage.verifyOnPage('MDI')

      amendPrisonAddressPage.addressTown().clear().type('Doncaster Town')
      amendPrisonAddressPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })
})
