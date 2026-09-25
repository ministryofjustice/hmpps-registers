import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  description: 'Sheffield Main Crown Court',
  active: false,
  inactiveDate: '2023-01-01',
  courtType: { code: 'CC', description: 'Crown Court' },
  accessibleAccess: 'WHEELCHAIR_ACCESS',
  cjitCode: 'C00SH00',
})

context('Court register - court details navigation', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.signIn()
  })

  it('Will display court details', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage()
      .viewCourtLink(sheffieldCrownCourt.courtId)
      .should('contain.text', sheffieldCrownCourt.courtName)
      .click()
    const courtDetailsPage = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)

    courtDetailsPage.courtName().should('contain.text', sheffieldCrownCourt.courtName)
    courtDetailsPage.description().should('contain.text', sheffieldCrownCourt.description)
    courtDetailsPage.active().should('contain.text', 'Inactive')
    courtDetailsPage.courtType().should('contain.text', 'Crown Court')
    courtDetailsPage.inactiveDate().should('contain.text', '1 January 2023')
    courtDetailsPage.accessibleAccess().should('contain.text', 'Wheelchair access')
  })
})
