import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import AddAgencyAddress from '../pages/components/edit/addAgencyAddress'
import courtData from '../../server/routes/testutils/mockCourtData'

const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  addresses: [courtData.address({ id: 1 })],
})

const addedAddresses = () => cy.task('getAddedCourtAddresses', sheffieldCrownCourt.courtId)

context('Court register - add address to a court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubAddCourtAddress', sheffieldCrownCourt.courtId)
    cy.signIn()

    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show a link to add an address on the court details page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
      .addAddressLink()
      .should('contain.text', 'Add address')
      .should('have.attr', 'href', '/court-register/address/create?id=SHFCC')
  })

  it('will allow adding an address when the court has none', () => {
    cy.task('stubGetCourt', { ...sheffieldCrownCourt, addresses: [] })
    cy.reload()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
  })

  it('will navigate to an empty add address page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.caption().should('contain.text', 'Add address')
    addAddressPage.addressLine1().should('have.value', '')
    addAddressPage.town().should('have.value', '')
    addAddressPage.postcode().should('have.value', '')
    ;['England', 'Northern Ireland', 'Scotland', 'Wales'].forEach(country =>
      addAddressPage.country(country).should('not.be.checked'),
    )
    addAddressPage.saveButton().should('contain.text', 'Confirm and save')
    addAddressPage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will return to court details without saving when cancelled', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.town().type('Sheffield')
    addAddressPage.cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    addedAddresses().should('be.empty')
  })

  it('will require the town, postcode and country', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName).saveButton().click()

    const pageWithErrors = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresstown').should('contain.text', 'Enter the town or city')
    pageWithErrors.error('addresspostcode').should('contain.text', 'Enter the postcode, like AA11AA')
    pageWithErrors.error('addresscountry').should('contain.text', 'Select the country')
    cy.url().should('include', '/court-register/address/create?id=SHFCC')
    addedAddresses().should('be.empty')
  })

  it('will reject an invalid postcode and retain the entered values', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.addressLine1().type('1 High Street')
    addAddressPage.town().type('Sheffield')
    addAddressPage.postcode().type('BANANAS')
    addAddressPage.country('Wales').check()
    addAddressPage.saveButton().click()

    const pageWithErrors = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresspostcode').should('contain.text', 'Enter a real postcode, like AA11AA')
    pageWithErrors.addressLine1().should('have.value', '1 High Street')
    pageWithErrors.town().should('have.value', 'Sheffield')
    pageWithErrors.postcode().should('have.value', 'BANANAS')
    pageWithErrors.country('Wales').should('be.checked')
    addedAddresses().should('be.empty')
  })

  it('will reject fields longer than 80 characters', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.addressLine1().type('A'.repeat(81), { delay: 0 })
    addAddressPage.town().type('Sheffield')
    addAddressPage.postcode().type('S1 2BJ')
    addAddressPage.country('England').check()
    addAddressPage.saveButton().click()

    AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
      .error('addressline1')
      .should('contain.text', 'Enter the first line of the address not greater than 80 characters')
    addedAddresses().should('be.empty')
  })

  it('will not show a previously entered address when returning to the page', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.town().type('Sheffield')
    addAddressPage.saveButton().click()
    AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName).town().should('have.value', '')
  })

  it('will add a trimmed address with optional fields omitted and show the confirmation', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.addressLine1().type('  1 High Street  ')
    addAddressPage.town().type('  Sheffield  ')
    addAddressPage.postcode().type('S1 2BJ')
    addAddressPage.country('England').check()
    cy.task('stubGetCourt', {
      ...sheffieldCrownCourt,
      addresses: [
        ...sheffieldCrownCourt.addresses,
        courtData.address({
          id: 100,
          addressLine1: '1 High Street',
          addressLine2: null,
          town: 'Sheffield',
          county: null,
          postcode: 'S1 2BJ',
          country: 'England',
        }),
      ],
    })
    addAddressPage.saveButton().click()

    const courtDetails = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    courtDetails.address().should('have.length', 2).last().should('contain.text', '1 High Street')
    addedAddresses().should('deep.equal', [
      { addressLine1: '1 High Street', town: 'Sheffield', postcode: 'S1 2BJ', country: 'England' },
    ])
  })

  it('will add the address once validation errors have been corrected', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).addAddressLink().click()

    const addAddressPage = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    addAddressPage.addressLine1().type('1 High Street')
    addAddressPage.addressLine2().type('City Centre')
    addAddressPage.town().type('Sheffield')
    addAddressPage.county().type('South Yorkshire')
    addAddressPage.postcode().type('BANANAS')
    addAddressPage.saveButton().click()

    const pageWithErrors = AddAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresspostcode').should('be.visible')
    pageWithErrors.error('addresscountry').should('be.visible')
    pageWithErrors.postcode().clear().type('S1 2BJ')
    pageWithErrors.country('Scotland').check()
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    addedAddresses().should('deep.equal', [
      {
        addressLine1: '1 High Street',
        addressLine2: 'City Centre',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 2BJ',
        country: 'Scotland',
      },
    ])
  })
})
