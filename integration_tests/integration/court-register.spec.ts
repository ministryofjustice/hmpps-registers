import IndexPage from '../pages'
import AllCourtsPage from '../pages/court-register/allCourts'
import CourtDetailsPage from '../pages/court-register/courtDetails'

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
    cy.task('stubCourt', {
      courtId: 'SHFCC',
      courtName: 'Sheffield Crown Court',
      courtDescription: 'Sheffield Crown Court - Yorkshire',
      courtType: 'CROWN',
      active: true,
    })
    cy.task('stubCourt', {
      courtId: 'SHFMC',
      courtName: 'Sheffield Magistrates Court',
      courtDescription: 'Sheffield Magistrates Court - Yorkshire',
      courtType: 'MAGISTRATES',
      active: false,
    })
    cy.task('stubUpdateCourt')
    cy.login()
  })

  it('Can navigate to court registers', () => {
    IndexPage.verifyOnPage().courtRegisterLink().should('contain.text', 'Court register').click()
    AllCourtsPage.verifyOnPage()
  })

  it('Will display all courts', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    const courtRegisterPage = AllCourtsPage.verifyOnPage()

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
  it('Can deactivate open court', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourtsPage.verifyOnPage().viewCourtLink('SHFCC').should('contain.text', 'Sheffield Crown Court').click()
    CourtDetailsPage.verifyOnPage('Sheffield Crown Court').markAsClosedButton().click()
    CourtDetailsPage.verifyOnPage('Sheffield Crown Court').deactivatedConfirmationBlock().should('exist')
  })
  it('Can activate closed court', () => {
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourtsPage.verifyOnPage().viewCourtLink('SHFMC').should('contain.text', 'Sheffield Magistrates Court').click()
    CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').markAsOpenButton().click()
    CourtDetailsPage.verifyOnPage('Sheffield Magistrates Court').activatedConfirmationBlock().should('exist')
  })
})
