import IndexPage from '../pages'
import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import UpdateAgencyAddress from '../pages/components/edit/updateAgencyAddress'
import courtData from '../../server/routes/testutils/mockCourtData'

const firstAddress = courtData.address({
  id: 1,
  addressLine1: '1 First Street',
  addressLine2: 'First Building',
  town: 'Leeds',
  county: 'West Yorkshire',
  postcode: 'LS1 1UR',
  country: 'England',
})
const secondAddress = courtData.address({
  id: 2,
  addressLine1: '2 Second Street',
  addressLine2: 'Second Building',
  town: 'Sheffield',
  county: 'South Yorkshire',
  postcode: 'S1 2BJ',
  country: 'England',
})
const sheffieldCrownCourt = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  addresses: [firstAddress, secondAddress],
})

const updatedAddresses = (addressId = 2) =>
  cy.task('getUpdatedCourtAddresses', { courtId: sheffieldCrownCourt.courtId, addressId })

const openSecondAddress = () => {
  CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateAddressLink().eq(1).click()
  return UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
}

const verifyPrefilledAddress = (address: typeof secondAddress) => {
  const addressPage = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
  addressPage.addressId().should('have.value', String(address.id))
  addressPage.addressLine1().should('have.value', address.addressLine1)
  addressPage.addressLine2().should('have.value', address.addressLine2)
  addressPage.town().should('have.value', address.town)
  addressPage.county().should('have.value', address.county)
  addressPage.postcode().should('have.value', address.postcode)
  addressPage.country(address.country).should('be.checked')
}

context('Court register - update an address', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [sheffieldCrownCourt])
    cy.task('stubGetCourt', sheffieldCrownCourt)
    cy.task('stubUpdateCourtAddress', { courtId: sheffieldCrownCourt.courtId, addressId: 2 })
    cy.task('stubGetTownSuggestions', [
      { code: 'SHEF', description: 'Sheffield' },
      { code: 'SHEP', description: 'Shepton Mallet' },
      { code: 'LEED', description: 'Leeds' },
    ])
    cy.task('stubGetCountySuggestions', [
      { code: 'SY', description: 'South Yorkshire' },
      { code: 'WY', description: 'West Yorkshire' },
      { code: 'DERB', description: 'Derbyshire' },
    ])
    cy.signIn()
    IndexPage.verifyOnPage().courtRegisterLink().click()
    AllCourts.verifyOnPage().viewCourtLink(sheffieldCrownCourt.courtId).click()
  })

  it('will show an update link for each address', () => {
    const details = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    details.updateAddressLink().should('have.length', 2)
    ;[firstAddress, secondAddress].forEach((address, index) => {
      details
        .updateAddressLink()
        .eq(index)
        .should('contain.text', 'Update')
        .should('have.attr', 'href', `/court-register/address/update?id=SHFCC&addressId=${address.id}`)
    })
  })

  it('will prefill only the selected address including its autocomplete fields and country', () => {
    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName).updateAddressLink().first().click()
    verifyPrefilledAddress(firstAddress)
    UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName).cancelLink().click()

    const addressPage = openSecondAddress()
    verifyPrefilledAddress(secondAddress)
    addressPage.caption().should('contain.text', 'Update address')
    addressPage.saveButton().should('contain.text', 'Confirm and save')
    addressPage.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
  })

  it('will cancel without sending an update request', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear().type('Unsaved address')
    addressPage.cancelLink().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC')
    updatedAddresses().should('be.empty')
    updatedAddresses(1).should('be.empty')
  })

  it('will require town, postcode and country and retain cleared fields rather than API values', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear()
    addressPage.addressLine2().clear()
    addressPage.town().clear()
    addressPage.county().clear()
    addressPage.postcode().clear()
    addressPage.country('England').invoke('prop', 'checked', false)
    addressPage.saveButton().click()

    const pageWithErrors = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresstown').should('contain.text', 'Enter the town or city')
    pageWithErrors.error('addresspostcode').should('contain.text', 'Enter the postcode, like AA11AA')
    pageWithErrors.error('addresscountry').should('contain.text', 'Select the country')
    pageWithErrors.addressLine1().should('have.value', '')
    pageWithErrors.addressLine2().should('have.value', '')
    pageWithErrors.town().should('have.value', '')
    pageWithErrors.county().should('have.value', '')
    pageWithErrors.postcode().should('have.value', '')
    ;['England', 'Northern Ireland', 'Scotland', 'Wales'].forEach(country =>
      pageWithErrors.country(country).should('not.be.checked'),
    )
    pageWithErrors.addressId().should('have.value', '2')
    cy.url().should('include', '/court-register/address/update?id=SHFCC&addressId=2')
    updatedAddresses().should('be.empty')
  })

  it('will reject an invalid postcode and redisplay every submitted field and country', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear().type('3 Changed Street')
    addressPage.addressLine2().clear().type('Changed Building')
    addressPage.town().clear().type('Changed Town')
    addressPage.county().clear().type('Changed County')
    addressPage.postcode().clear().type('BANANAS')
    addressPage.country('Wales').check()
    addressPage.saveButton().click()

    const pageWithErrors = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresspostcode').should('contain.text', 'Enter a real postcode, like AA11AA')
    pageWithErrors.addressLine1().should('have.value', '3 Changed Street')
    pageWithErrors.addressLine2().should('have.value', 'Changed Building')
    pageWithErrors.town().should('have.value', 'Changed Town')
    pageWithErrors.county().should('have.value', 'Changed County')
    pageWithErrors.postcode().should('have.value', 'BANANAS')
    pageWithErrors.country('Wales').should('be.checked')
    pageWithErrors.addressId().should('have.value', '2')
    updatedAddresses().should('be.empty')
  })

  it('will reject all address fields longer than 80 characters', () => {
    const addressPage = openSecondAddress()
    const tooLong = 'A'.repeat(81)
    addressPage.addressLine1().clear().type(tooLong, { delay: 0 })
    addressPage.addressLine2().clear().type(tooLong, { delay: 0 })
    addressPage.town().clear().type(tooLong, { delay: 0 })
    addressPage.county().clear().type(tooLong, { delay: 0 })
    addressPage.saveButton().click()

    const pageWithErrors = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    ;[
      ['addressline1', 'Enter the first line of the address not greater than 80 characters'],
      ['addressline2', 'Enter the second line of the address not greater than 80 characters'],
      ['addresstown', 'Enter the town or city not greater than 80 characters'],
      ['addresscounty', 'Enter the county not greater than 80 characters'],
    ].forEach(([field, message]) => pageWithErrors.error(field).should('contain.text', message))
    pageWithErrors.addressLine1().should('have.value', tooLong)
    pageWithErrors.addressLine2().should('have.value', tooLong)
    pageWithErrors.town().should('have.value', tooLong)
    pageWithErrors.county().should('have.value', tooLong)
    updatedAddresses().should('be.empty')
  })

  it('will reset submitted values to the API address on a fresh visit', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear().type('Unsaved street')
    addressPage.addressLine2().clear()
    addressPage.town().clear().type('Unsaved town')
    addressPage.county().clear()
    addressPage.postcode().clear().type('BANANAS')
    addressPage.country('Scotland').check()
    addressPage.saveButton().click()
    const pageWithErrors = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresspostcode').should('be.visible')
    pageWithErrors.cancelLink().click()

    openSecondAddress()
    verifyPrefilledAddress(secondAddress)
    updatedAddresses().should('be.empty')
  })

  it('will filter autocomplete suggestions and save the selected town and county', () => {
    cy.intercept('GET', '/api/search-town?*').as('searchTown')
    cy.intercept('GET', '/api/search-county?*').as('searchCounty')
    const addressPage = openSecondAddress()
    addressPage.town().clear().type('sHe', { delay: 0 })
    cy.wait('@searchTown')
      .its('response.body')
      .should('deep.equal', [
        { code: 'SHEF', description: 'Sheffield' },
        { code: 'SHEP', description: 'Shepton Mallet' },
      ])
    addressPage.townSuggestions().should('have.length', 2)
    addressPage.townSuggestions().contains('Shepton Mallet').click()
    addressPage.town().should('have.value', 'Shepton Mallet')
    addressPage.county().clear().type('yOrK', { delay: 0 })
    cy.wait('@searchCounty')
      .its('response.body')
      .should('deep.equal', [
        { code: 'SY', description: 'South Yorkshire' },
        { code: 'WY', description: 'West Yorkshire' },
      ])
    addressPage.countySuggestions().should('have.length', 2)
    addressPage.countySuggestions().contains('West Yorkshire').click()
    addressPage.county().should('have.value', 'West Yorkshire')
    addressPage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedAddresses().should('deep.equal', [
      {
        addressLine1: secondAddress.addressLine1,
        addressLine2: secondAddress.addressLine2,
        town: 'Shepton Mallet',
        county: 'West Yorkshire',
        postcode: secondAddress.postcode,
        country: secondAddress.country,
      },
    ])
    updatedAddresses(1).should('be.empty')
  })

  it('will trim and update only the second address and show the updated details and confirmation', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear().type('  3 Updated Street  ')
    addressPage.addressLine2().clear().type('  Updated Building  ')
    addressPage.town().clear().type('  Cardiff  ')
    addressPage.county().clear().type('  South Glamorgan  ')
    addressPage.postcode().clear().type('  CF10 1EP  ')
    addressPage.country('Wales').check()
    const updatedAddress = {
      addressLine1: '3 Updated Street',
      addressLine2: 'Updated Building',
      town: 'Cardiff',
      county: 'South Glamorgan',
      postcode: 'CF10 1EP',
      country: 'Wales',
    }
    cy.task('stubGetCourt', {
      ...sheffieldCrownCourt,
      addresses: [firstAddress, courtData.address({ id: 2, ...updatedAddress })],
    })
    addressPage.saveButton().click()

    const details = CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    details.address().should('have.length', 2).first().should('contain.text', firstAddress.addressLine1)
    Object.values(updatedAddress).forEach(value => details.address().last().should('contain.text', value))
    details.address().last().should('not.contain.text', secondAddress.addressLine1)
    updatedAddresses().should('deep.equal', [updatedAddress])
    updatedAddresses(1).should('be.empty')
  })

  it('will remove optional fields when they are cleared or contain only whitespace', () => {
    const addressPage = openSecondAddress()
    addressPage.addressLine1().clear()
    addressPage.addressLine2().clear().type('   ')
    addressPage.county().clear().type('   ')
    addressPage.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedAddresses().should('deep.equal', [
      { town: secondAddress.town, postcode: secondAddress.postcode, country: secondAddress.country },
    ])
    updatedAddresses(1).should('be.empty')
  })

  it('will update the address after correcting validation errors', () => {
    const addressPage = openSecondAddress()
    addressPage.postcode().clear().type('BANANAS')
    addressPage.country('England').invoke('prop', 'checked', false)
    addressPage.saveButton().click()

    const pageWithErrors = UpdateAgencyAddress.verifyOnPage(sheffieldCrownCourt.courtName)
    pageWithErrors.error('addresspostcode').should('be.visible')
    pageWithErrors.error('addresscountry').should('be.visible')
    updatedAddresses().should('be.empty')
    pageWithErrors.postcode().clear().type('S2 1AA')
    pageWithErrors.country('Scotland').check()
    pageWithErrors.saveButton().click()

    CourtsDetails.verifyOnPage(sheffieldCrownCourt.courtName)
    updatedAddresses().should('deep.equal', [
      {
        addressLine1: secondAddress.addressLine1,
        addressLine2: secondAddress.addressLine2,
        town: secondAddress.town,
        county: secondAddress.county,
        postcode: 'S2 1AA',
        country: 'Scotland',
      },
    ])
    updatedAddresses(1).should('be.empty')
  })
})
