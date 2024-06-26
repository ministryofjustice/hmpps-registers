import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/prisonRegister'
import AllPrisonsPage from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'
import AmendPrisonDetailsPage from '../pages/prison-register/amendPrisonDetails'

context('Prison register - amend existing prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrison', belmarshPrison)
    cy.task('stubUpdatePrison', moorlandPrison)
    cy.signIn()
  })

  describe('amending a prison', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisonsPage.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
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
    it('will return to prison details page with success message after saving name', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')

      amendPrisonDetailsPage.name().clear().type('HMP Moorland New Prison')
      amendPrisonDetailsPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
    it('will return to prison details page with success message after saving gender', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')
      amendPrisonDetailsPage.maleCheckbox().should('not.be.checked')
      amendPrisonDetailsPage.femaleCheckbox().should('be.checked')

      amendPrisonDetailsPage.maleCheckbox().click()
      amendPrisonDetailsPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
    it('will return to prison details page with success message after saving contracted status', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')
      amendPrisonDetailsPage.contractedRadioYes().should('be.checked')
      amendPrisonDetailsPage.contractedRadioNo().should('not.be.checked')
      amendPrisonDetailsPage.contractedRadioNo().click()
      amendPrisonDetailsPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
    it('will return to prison details page with success message after saving prison types', () => {
      const prisonDetailsPage = PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName)
      prisonDetailsPage.amendPrisonDetailsLink().click()
      const amendPrisonDetailsPage = AmendPrisonDetailsPage.verifyOnPage('MDI')

      amendPrisonDetailsPage.hmpCheckbox().should('be.checked')
      amendPrisonDetailsPage.yoiCheckbox().should('be.checked')
      amendPrisonDetailsPage.stcCheckbox().should('not.be.checked')
      amendPrisonDetailsPage.ircCheckbox().should('not.be.checked')
      amendPrisonDetailsPage.ycsCheckbox().should('not.be.checked')

      amendPrisonDetailsPage.stcCheckbox().click()
      amendPrisonDetailsPage.ircCheckbox().click()
      amendPrisonDetailsPage.saveButton().click()

      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).prisonUpdatedConfirmationBlock().should('exist')
    })
  })

  describe('deactivating an active prison', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisonsPage.verifyOnPage().viewPrisonLink('MDI').should('contain.text', moorlandPrison.prisonName).click()
    })
    it('Can deactivate active prison', () => {
      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).markAsInactiveButton('MDI').click()
      PrisonDetailsPage.verifyOnPage(moorlandPrison.prisonName).deactivatedConfirmationBlock().should('exist')
    })
  })
  describe('activating an inactive prison', () => {
    beforeEach(() => {
      IndexPage.verifyOnPage().prisonRegisterLink().click()
      AllPrisonsPage.verifyOnPage().viewPrisonLink('BAI').should('contain.text', belmarshPrison.prisonName).click()
    })
    it('Can activate an inactive prison', () => {
      PrisonDetailsPage.verifyOnPage(belmarshPrison.prisonName).markAsActiveButton('BAI').click()
      PrisonDetailsPage.verifyOnPage(belmarshPrison.prisonName).activatedConfirmationBlock().should('exist')
    })
  })
})
