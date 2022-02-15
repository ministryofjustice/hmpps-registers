import { albanyPrison } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllPrisons from '../pages/prison-register/allPrisons'

context('Prison register - prison list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubGetAllPrisons', [albanyPrison])
    cy.login()
  })

  it('Will display a page of prisons', () => {
    IndexPage.verifyOnPage().prisonRegisterLink().click()
    const prisonRegisterPage = AllPrisons.verifyOnPage()

    {
      const { id, name, active } = prisonRegisterPage.prisons(0)
      id().contains(albanyPrison.prisonId)
      name().contains(albanyPrison.prisonName)
      active().contains('Active')
    }
  })
})
