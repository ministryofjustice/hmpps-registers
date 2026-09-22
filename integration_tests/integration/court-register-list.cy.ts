import { sheffieldCrownCourt } from '../mockApis/prisonRegister'
import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'

context('Court register - court list navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.signIn()
  })

  it('Will display a page of courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = AllCourts.verifyOnPage()

    {
      const { id, name, active, type } = courtRegisterPage.courts(0)
      id().contains(sheffieldCrownCourt.courtId)
      name().contains(sheffieldCrownCourt.courtName)
      active().contains('Active')
      type().contains('Crown Court')
    }
  })
})
