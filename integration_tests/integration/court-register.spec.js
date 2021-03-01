const IndexPage = require('../pages/index')
const CourtRegisterPage = require('../pages/court-register')

context('Court register', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('stubCourts', [
      {
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        courtType: 'CROWN',
        active: true,
      },
      {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        courtType: 'MAGISTRATES',
        active: false,
      },
    ])
    cy.login()
  })

  it('Can navigate to court registers', () => {
    const landingPage = IndexPage.verifyOnPage()
    landingPage.courtRegisterLink().should('contain.text', 'Court register')
    landingPage.courtRegisterLink().click()
    CourtRegisterPage.verifyOnPage()
  })

  it('Will display all courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = CourtRegisterPage.verifyOnPage()

    {
      const { code, name, type, status } = courtRegisterPage.courts(0)
      code().contains('SHFCC')
      name().contains('Sheffield Crown Court')
      type().contains('Crown')
      status().contains('Active')
    }
    {
      const { code, name, type, status } = courtRegisterPage.courts(1)
      code().contains('SHFMC')
      name().contains('Sheffield Magistrates Court')
      type().contains('Magistrates')
      status().contains('Closed')
    }
  })
})
