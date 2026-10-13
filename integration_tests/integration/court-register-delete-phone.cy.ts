import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import DeleteAgencyPhone from '../pages/components/edit/deleteAgencyPhone'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  phoneNumbers: [
    { id: 1, number: '0114 555 1111' },
    { id: 2, number: '0114 555 2222' },
  ],
})

function deletePhoneNumberRequestCount(phoneId: number) {
  return cy.task('getDeletedCourtPhoneNumberRequests', { courtId: sheffieldCrownCourt.courtId, phoneId })
}

context('Court register - delete phone number from a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubDeleteCourtPhoneNumber', { courtId: sheffieldCrownCourt.courtId, phoneId: 1 })
    cy.task('stubDeleteCourtPhoneNumber', { courtId: sheffieldCrownCourt.courtId, phoneId: 2 })
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to delete each phone number on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deletePhoneNumberLink().should('have.length', 2)
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .deletePhoneNumberLink()
      .eq(0)
      .should('contain.text', 'Delete')
      .should('have.attr', 'href', '/court-register/phone/delete?id=SHFCC&phoneId=1')
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .deletePhoneNumberLink()
      .eq(1)
      .should('have.attr', 'href', '/court-register/phone/delete?id=SHFCC&phoneId=2')
  })

  it('will not show a delete link when the court has no phone numbers', () => {
    cy.task('stubGetCourt', { ...sheffieldCrownCourt, phoneNumbers: [] })
    cy.reload()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deletePhoneNumberLink().should('not.exist')
  })

  it('will show the selected phone number on the delete confirmation page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deletePhoneNumberLink().eq(1).click()

    const deletePhonePage = DeleteAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    deletePhonePage.caption().should('contain.text', 'Delete phone number')
    deletePhonePage.phoneNumber().should('contain.text', '0114 555 2222')
    deletePhonePage.phoneId().should('have.value', '2')
    deletePhonePage.deleteButton().should('contain.text', 'Delete phone number')
    deletePhonePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
    deletePhoneNumberRequestCount(2).should('equal', 0)
  })

  it('will return to court details without deleting when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deletePhoneNumberLink().first().click()

    DeleteAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    deletePhoneNumberRequestCount(1).should('equal', 0)
  })

  it('will delete only the selected phone number and show the confirmation', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).deletePhoneNumberLink().eq(1).click()

    const deletePhonePage = DeleteAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.task('stubGetCourt', { ...sheffieldCrownCourt, phoneNumbers: [sheffieldCrownCourt.phoneNumbers[0]] })
    deletePhonePage.deleteButton().click()

    const courtDetails = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    courtDetails.phoneNumber().should('have.length', 1).and('contain.text', '0114 555 1111')
    deletePhoneNumberRequestCount(2).should('equal', 1)
    deletePhoneNumberRequestCount(1).should('equal', 0)
  })
})
