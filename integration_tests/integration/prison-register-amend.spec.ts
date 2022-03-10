import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'
import AllPrisons from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AmendPrisonDetailsPage from '../pages/prison-register/amendPrisonDetails'

context('Prison register - amend existing prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison, active: false }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubUpdatePrison', moorlandPrison)
    cy.login()
  })

  describe('amending a prison', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisons.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
    })
    it('should show summary of prison with link to amend', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.prisonDetailsSection().should('contain.text', moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().should('contain.text', 'Change')
    })
    it('can navigate to amend prison details page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')

      amendPrisonDetailsPage.name().should('have.value', moorlandPrison.prisonName)
      amendPrisonDetailsPage.saveButton()
    })
    it('will validate prison details page', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')

      amendPrisonDetailsPage.name().clear().type('A')
      amendPrisonDetailsPage.saveButton().click()

      const prisonDetailsWithErrors = AmendPrisonDetailsPage.verifyOnPage('MDI')
      prisonDetailsWithErrors.errorSummary().contains('Enter a prison name between 3 and 80 characters')
    })
    it('will return to prison details page with success message after saving', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')

      amendPrisonDetailsPage.name().clear().type('HMP Moorland New Prison')
      amendPrisonDetailsPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })
})
