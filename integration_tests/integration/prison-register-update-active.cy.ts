import IndexPage from '../pages'
import { albanyPrison, belmarshPrison, moorlandPrison } from '../mockApis/hmppsAgencyRegisterApi'
import AllPrisonsPage from '../pages/prison-register/allPrisons'
import PrisonDetailsPage from '../pages/prison-register/prisonDetails'

context('Prison register - activate and deactivate prison', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPrisonsWithFilter', [albanyPrison, { ...belmarshPrison }, moorlandPrison])
    cy.task('stubGetPrison', moorlandPrison)
    cy.task('stubGetPrison', belmarshPrison)
    cy.task('stubGetPrisonDetails', moorlandPrison)
    cy.task('stubGetPrisonDetails', belmarshPrison)
    cy.task('stubUpdatePrison', moorlandPrison)
    cy.signIn()
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
