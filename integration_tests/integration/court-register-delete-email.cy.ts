import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import DeleteAgencyEmail from '../pages/components/edit/deleteAgencyEmail'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  emailAddresses: [{ id: 1, address: 'test1@example.com' }],
})

function deleteEmailAddressRequestCount(courtId: string, emailId: number) {
  return cy.task('getDeletedCourtEmailAddressRequests', { courtId, emailId })
}

context('Court register - delete email address from a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubDeleteCourtEmailAddress', { courtId: sheffieldCrownCourt.courtId, emailId: 1 })
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to delete each email address on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .deleteEmailAddressLink()
      .should('contain.text', 'Delete')
      .should('have.attr', 'href', '/court-register/email/delete?id=SHFCC&emailId=1')
  })

  it('will show the selected email address on the delete confirmation page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deleteEmailAddressLink().click()

    const deleteEmailPage = DeleteAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    deleteEmailPage.caption().should('contain.text', 'Delete email address')
    deleteEmailPage.emailAddress().should('contain.text', 'test1@example.com')
    deleteEmailPage.deleteButton().should('contain.text', 'Delete email')
    deleteEmailPage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
    deleteEmailAddressRequestCount(sheffieldCrownCourt.courtId, 1).should('equal', 0)
  })

  it('will return to court details without deleting when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deleteEmailAddressLink().click()

    DeleteAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    deleteEmailAddressRequestCount(sheffieldCrownCourt.courtId, 1).should('equal', 0)
  })

  it('will delete the email address and return to the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deleteEmailAddressLink().click()

    DeleteAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).deleteButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    deleteEmailAddressRequestCount(sheffieldCrownCourt.courtId, 1).should('equal', 1)
  })
})
