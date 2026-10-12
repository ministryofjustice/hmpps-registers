import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import AddAgencyPhone from '../pages/components/edit/addAgencyPhone'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  phoneNumbers: [{ id: 1, number: '0114 555 9898' }],
})

context('Court register - add phone number to a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubAddCourtPhoneNumber', sheffieldCrownCourt.courtId)
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to add a phone number on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .addPhoneNumberLink()
      .should('contain.text', 'Add phone number')
      .should('have.attr', 'href', '/court-register/phone/create?id=SHFCC')
  })

  it('will allow adding a phone number when the court has none', () => {
    cy.task('stubGetCourt', { ...sheffieldCrownCourt, phoneNumbers: [] })
    cy.reload()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
  })

  it('will navigate to the add phone number page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    addPhonePage.caption().should('contain.text', 'Add phone number')
    addPhonePage.phoneNumber().should('have.value', '').should('have.attr', 'type', 'tel')
    addPhonePage.saveButton().should('contain.text', 'Confirm and save')
    addPhonePage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to court details without saving when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    addPhonePage.phoneNumber().type('0114 555 9898')
    addPhonePage.cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    cy.task('getAddedCourtPhoneNumbers', sheffieldCrownCourt.courtId).should('be.empty')
  })

  ;['', '   '].forEach(phoneNumber => {
    it(`will require a non-blank phone number: "${phoneNumber}"`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

      const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      if (phoneNumber) addPhonePage.phoneNumber().type(phoneNumber)
      addPhonePage.saveButton().click()

      AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
        .phoneNumberError()
        .should('contain.text', 'Enter a phone number')
      cy.url().should('include', '/court-register/phone/create?id=SHFCC')
      cy.task('getAddedCourtPhoneNumbers', sheffieldCrownCourt.courtId).should('be.empty')
    })
  })

  ;['not-a-number', '0114/555/9898'].forEach(phoneNumber => {
    it(`will reject unsupported characters and retain the entered value: ${phoneNumber}`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

      const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      addPhonePage.phoneNumber().type(phoneNumber)
      addPhonePage.saveButton().click()

      const addPhonePageWithErrors = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      addPhonePageWithErrors
        .phoneNumberError()
        .should('contain.text', 'Enter a phone number using only numbers, spaces, plus signs and dashes')
      addPhonePageWithErrors.phoneNumber().should('have.value', phoneNumber)
      cy.task('getAddedCourtPhoneNumbers', sheffieldCrownCourt.courtId).should('be.empty')
    })
  })

  it('will not show a previously entered phone number when returning to the page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    addPhonePage.phoneNumber().type('not-a-number')
    addPhonePage.saveButton().click()
    AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName).phoneNumber().should('have.value', '')
  })

  ;['01145559898', '0114 555 9898', '+44 114-555-9898'].forEach(phoneNumber => {
    it(`will add and trim a valid phone number and return to court details: ${phoneNumber}`, () => {
      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

      const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
      addPhonePage.phoneNumber().type(`  ${phoneNumber}  `)
      cy.task('stubGetCourt', {
        ...sheffieldCrownCourt,
        phoneNumbers: [...sheffieldCrownCourt.phoneNumbers, { id: 100, number: phoneNumber }],
      })
      addPhonePage.saveButton().click()

      CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).phoneNumber().should('contain.text', phoneNumber)
      cy.url().should('include', '/court-register/details?id=SHFCC')
      cy.task('getAddedCourtPhoneNumbers', sheffieldCrownCourt.courtId).should('deep.equal', [{ number: phoneNumber }])
    })
  })

  it('will add the phone number once a validation error has been corrected', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addPhoneNumberLink().click()

    const addPhonePage = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    addPhonePage.phoneNumber().type('not-a-number')
    addPhonePage.saveButton().click()

    const addPhonePageWithErrors = AddAgencyPhone.verifyOnPage(sheffieldCrownCourt.courtName)
    addPhonePageWithErrors.phoneNumberError().should('be.visible')
    addPhonePageWithErrors.phoneNumber().clear().type('0114 555 9898')
    addPhonePageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.task('getAddedCourtPhoneNumbers', sheffieldCrownCourt.courtId).should('deep.equal', [
      { number: '0114 555 9898' },
    ])
  })
})
