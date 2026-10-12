import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyPhone from '../pages/components/edit/updateAgencyPhone'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  phoneNumbers: [
    { id: 1, number: '0114 555 1111' },
    { id: 2, number: '0114 555 2222' },
  ],
})

const updatedPhoneRequests = (phoneId = 1) =>
  cy.task('getUpdatedCourtPhoneNumbers', { courtId: sheffieldCrownCourt.courtId, phoneId })

context('Court register - update a court phone number', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubUpdateCourtPhoneNumber', { courtId: sheffieldCrownCourt.courtId, phoneId: 1 })
    cy.task('stubUpdateCourtPhoneNumber', { courtId: sheffieldCrownCourt.courtId, phoneId: 2 })
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show an update link for each phone number', () => {
    const links = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink()
    links.should('have.length', 2)
    links
      .eq(0)
      .should('contain.text', 'Update')
      .should('have.attr', 'href', '/court-register/phone/update?id=SHFCC&phoneId=1')
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .updatePhoneNumberLink()
      .eq(1)
      .should('have.attr', 'href', '/court-register/phone/update?id=SHFCC&phoneId=2')
  })

  it('will prefill the selected phone number and show the save and cancel controls', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().eq(1).click()

    const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    updatePhonePage.caption().should('contain.text', 'Update phone number')
    updatePhonePage.phoneNumber().should('have.value', '0114 555 2222').should('have.attr', 'type', 'tel')
    updatePhonePage.phoneId().should('have.value', '2')
    updatePhonePage.saveButton().should('contain.text', 'Confirm and save')
    updatePhonePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will cancel without updating the phone number', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

    const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    updatePhonePage.phoneNumber().clear().type('0114 555 9999')
    updatePhonePage.cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedPhoneRequests().should('be.empty')
  })

  ;['', '   '].forEach(phoneNumber => {
    it(`will require a non-blank phone number: "${phoneNumber}"`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

      const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      updatePhonePage.phoneNumber().clear()
      if (phoneNumber) updatePhonePage.phoneNumber().type(phoneNumber)
      updatePhonePage.saveButton().click()

      const pageWithErrors = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      pageWithErrors.phoneNumberError().should('contain.text', 'Enter a phone number')
      pageWithErrors.phoneNumber().should('have.value', '')
      pageWithErrors.phoneId().should('have.value', '1')
      cy.url().should('include', '/court-register/phone/update?id=SHFCC&phoneId=1')
      updatedPhoneRequests().should('be.empty')
    })
  })

  ;['not-a-number', '0114/555/9898'].forEach(phoneNumber => {
    it(`will reject unsupported characters and retain the input: ${phoneNumber}`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

      const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      updatePhonePage.phoneNumber().clear().type(phoneNumber)
      updatePhonePage.saveButton().click()

      const pageWithErrors = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      pageWithErrors
        .phoneNumberError()
        .should('contain.text', 'Enter a phone number using only numbers, spaces, plus signs and dashes')
      pageWithErrors.phoneNumber().should('have.value', phoneNumber)
      updatedPhoneRequests().should('be.empty')
    })
  })

  it('will reload the current phone number when returning after a cancelled validation error', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

    const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    updatePhonePage.phoneNumber().clear().type('not-a-number')
    updatePhonePage.saveButton().click()
    UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

    UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName).phoneNumber().should('have.value', '0114 555 1111')
  })

  ;['01145559898', '0114 555 9898', '+44 114-555-9898'].forEach(phoneNumber => {
    it(`will trim and update the selected number and show the confirmation: ${phoneNumber}`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().eq(1).click()

      const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      updatePhonePage.phoneNumber().clear().type(`  ${phoneNumber}  `)
      cy.task('stubGetCourt', {
        ...sheffieldCrownCourt,
        phoneNumbers: [sheffieldCrownCourt.phoneNumbers[0], { id: 2, number: phoneNumber }],
      })
      updatePhonePage.saveButton().click()

      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
        .phoneNumber()
        .eq(0)
        .should('contain.text', '0114 555 1111')
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).phoneNumber().eq(1).should('contain.text', phoneNumber)
      cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
      cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
      updatedPhoneRequests(2).should('deep.equal', [{ number: phoneNumber }])
      updatedPhoneRequests(1).should('be.empty')
    })
  })

  it('will update once a validation error has been corrected', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updatePhoneNumberLink().first().click()

    const updatePhonePage = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    updatePhonePage.phoneNumber().clear().type('not-a-number')
    updatePhonePage.saveButton().click()

    const pageWithErrors = UpdateAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.phoneNumberError().should('be.visible')
    pageWithErrors.phoneNumber().clear().type('0114 555 9898')
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedPhoneRequests().should('deep.equal', [{ number: '0114 555 9898' }])
  })
})
