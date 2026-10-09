import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import courtData from '../../server/routes/testutils/mockCourtData'
import UpdateAgencyEmail from '../pages/components/edit/updateAgencyEmail'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  emailAddresses: [{ id: 1, address: 'test1@example.com' }],
})

function updateEmailAddressRequestBody(courtId: string, emailId: number) {
  return cy.task('getUpdatedCourtEmailAddresses', { courtId, emailId })
}

context('Court register - update email address to a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubUpdateCourtEmailAddress', { courtId: sheffieldCrownCourt.courtId, emailId: 1 })
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to update an email address on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .updateEmailAddressLink()
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/email/update?id=SHFCC&emailId=1')
  })

  it('will navigate to the update email address page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.caption().should('contain.text', 'Update email address')
    updateEmailPage.emailAddress().should('have.value', 'test1@example.com')
    updateEmailPage.saveButton().should('contain.text', 'Confirm and save')
    updateEmailPage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to the court details page when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    updateEmailAddressRequestBody(sheffieldCrownCourt.courtId, 1).should('be.empty')
  })

  it('will require an email address', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.emailAddress().clear()
    updateEmailPage.saveButton().click()

    const updateEmailPageWithErrors = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPageWithErrors.emailAddressError().should('contain.text', 'Enter an email address')
    cy.url().should('include', '/court-register/email/update?id=SHFCC&emailId=1')
    updateEmailAddressRequestBody(sheffieldCrownCourt.courtId, 1).should('be.empty')
  })

  it('will require a valid email address', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.emailAddress().clear()
    updateEmailPage.emailAddress().type('not-an-email')
    updateEmailPage.saveButton().click()

    const updateEmailPageWithErrors = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPageWithErrors.emailAddressError().should('contain.text', 'Enter a valid email address')
    updateEmailPageWithErrors.emailAddress().should('have.value', 'not-an-email')
    updateEmailAddressRequestBody(sheffieldCrownCourt.courtId, 1).should('be.empty')
  })

  it('will show a currently entered email address when returning to the page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.emailAddress().clear()
    updateEmailPage.emailAddress().type('not-an-email')
    updateEmailPage.saveButton().click()
    UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
      .emailAddress()
      .should('have.value', 'test1@example.com')
  })

  it('will add the email address and return to the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.emailAddress().clear()
    updateEmailPage.emailAddress().type('  new.email@example.com  ')
    updateEmailPage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailAddressRequestBody(sheffieldCrownCourt.courtId, 1).should('deep.equal', [
      { address: 'new.email@example.com' },
    ])
  })

  it('will add the email address once a validation error has been corrected', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateEmailAddressLink().click()

    const updateEmailPage = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPage.emailAddress().clear()
    updateEmailPage.emailAddress().type('not-an-email')
    updateEmailPage.saveButton().click()

    const updateEmailPageWithErrors = UpdateAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailPageWithErrors.emailAddressError().should('contain.text', 'Enter a valid email address')
    updateEmailPageWithErrors.emailAddress().clear().type('new.email@example.com')
    updateEmailPageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updateEmailAddressRequestBody(sheffieldCrownCourt.courtId, 1).should('deep.equal', [
      { address: 'new.email@example.com' },
    ])
  })
})
