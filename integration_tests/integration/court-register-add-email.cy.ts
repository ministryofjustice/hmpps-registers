import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import AddAgencyEmail from '../pages/components/edit/addAgencyEmail'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  emailAddresses: [{ id: 1, address: 'test1@example.com' }],
})

context('Court register - add email address to a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubAddCourtEmailAddress', sheffieldCrownCourt.courtId)
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to add an email address on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .addEmailAddressLink()
      .should('contain.text', 'Add email address')
      .should('have.attr', 'href', '/court-register/email/create?id=SHFCC')
  })

  it('will navigate to the add email address page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.caption().should('contain.text', 'Add email address')
    addEmailPage.emailAddress().should('have.value', '')
    addEmailPage.saveButton().should('contain.text', 'Confirm and save')
    addEmailPage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to the court details page when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    cy.task('getAddedCourtEmailAddresses', sheffieldCrownCourt.courtId).should('be.empty')
  })

  it('will require an email address', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).saveButton().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.emailAddressError().should('contain.text', 'Enter an email address')
    cy.url().should('include', '/court-register/email/create?id=SHFCC')
    cy.task('getAddedCourtEmailAddresses', sheffieldCrownCourt.courtId).should('be.empty')
  })

  it('will require a valid email address', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.emailAddress().type('not-an-email')
    addEmailPage.saveButton().click()

    const addEmailPageWithErrors = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPageWithErrors.emailAddressError().should('contain.text', 'Enter a valid email address')
    addEmailPageWithErrors.emailAddress().should('have.value', 'not-an-email')
    cy.task('getAddedCourtEmailAddresses', sheffieldCrownCourt.courtId).should('be.empty')
  })

  it('will not show a previously entered email address when returning to the page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.emailAddress().type('not-an-email')
    addEmailPage.saveButton().click()
    AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName).emailAddress().should('have.value', '')
  })

  it('will add the email address and return to the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.emailAddress().type('  new.email@example.com  ')
    addEmailPage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    cy.task('getAddedCourtEmailAddresses', sheffieldCrownCourt.courtId).should('deep.equal', [
      { address: 'new.email@example.com' },
    ])
  })

  it('will add the email address once a validation error has been corrected', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addEmailAddressLink().click()

    const addEmailPage = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPage.emailAddress().type('not-an-email')
    addEmailPage.saveButton().click()

    const addEmailPageWithErrors = AddAgencyEmail.verifyOnPage(sheffieldCrownCourt.courtName)
    addEmailPageWithErrors.emailAddressError().should('contain.text', 'Enter a valid email address')
    addEmailPageWithErrors.emailAddress().clear().type('new.email@example.com')
    addEmailPageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.task('getAddedCourtEmailAddresses', sheffieldCrownCourt.courtId).should('deep.equal', [
      { address: 'new.email@example.com' },
    ])
  })
})
