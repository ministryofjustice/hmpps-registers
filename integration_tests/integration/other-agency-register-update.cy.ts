import { areas } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllOtherAgencies from '../pages/other-agency-register/allOtherAgencies'
import OtherAgencyDetails from '../pages/other-agency-register/otherAgencyDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
import UpdateAgencyActive from '../pages/components/edit/updateAgencyActive'
import UpdateAgencyNameDescription from '../pages/components/edit/updateAgencyNameDescription'
import UpdateAgencyType from '../pages/other-agency-register/updateAgencyType'
import UpdateAgencyAccessibleAccess from '../pages/components/edit/updateAgencyAccessibleAccess'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import UpdateAgencyAddress from '../pages/components/edit/updateAgencyAddress'
import AddAgencyAddress from '../pages/components/edit/addAgencyAddress'
import UpdateAgencyPhone from '../pages/components/edit/updateAgencyPhone'
import AddAgencyPhone from '../pages/components/edit/addAgencyPhone'
import UpdateAgencyEmail from '../pages/components/edit/updateAgencyEmail'
import AddAgencyEmail from '../pages/components/edit/addAgencyEmail'
import otherAgencyData from '../../server/routes/testutils/mockOtherAgencyData'
import courtData from '../../server/routes/testutils/mockCourtData'

const office = otherAgencyData.otherAgency({
  agencyId: 'SHFPECS',
  agencyName: 'Sheffield PECS Agency',
  description: 'Sheffield City Centre PECS Agency',
  agencyType: 'PECS',
  accessibleAccess: 'ACCESSIBLE',
  active: false,
  inactiveDate: '2023-01-01',
  cjitCode: 'C00SF00',
  area: areas[0],
  region: { code: 'YOHUM', description: 'Yorkshire and the Humber' },
  geographicalArea: { code: 'SYORKS', description: 'South Yorkshire and Humberside' },
  localAuthority: { code: '00CG', description: 'Sheffield City Council' },
  payrollRegion: { code: 'NE', description: 'North East' },
  addresses: [
    courtData.address({
      id: 1,
      addressLine1: 'Shoreham Street',
      town: 'Sheffield',
      postcode: 'S2 4SY',
      country: 'England',
    }),
  ],
  phoneNumbers: [{ id: 7, number: '0114 220 2020' }],
  emailAddresses: [{ id: 3, address: 'custody@example.com' }],
})

const unchangedFields = {
  agencyName: office.agencyName,
  description: office.description,
  otherAgencyType: 'PECS',
  accessibleAccess: 'ACCESSIBLE',
  active: false,
  inactiveDate: '2023-01-01',
  cjitCode: 'C00SF00',
  areaCode: areas[0].code,
  regionCode: 'YOHUM',
  geographicalAreaCode: 'SYORKS',
  localAuthorityCode: '00CG',
  payrollRegionCode: 'NE',
}

const officeCall = (endpoint: string, method: 'POST' | 'PUT') => ({
  agencyId: office.agencyId,
  endpoint,
  method,
})
const updatedOffices = () => cy.task('getOtherAgencyApiRequests', officeCall('', 'PUT'))
const openUpdatePage = (qa: string) => {
  OtherAgencyDetails.verifyOnPage(office.agencyName).link(qa).first().click()
}

context('Other agency register - update other agency', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetOtherAgencies', [office])
    cy.task('stubGetOtherAgency', office)
    cy.task('stubGetAreas', areas)
    cy.task('stubOtherAgencyApi', { ...officeCall('', 'PUT'), jsonBody: office })
    cy.signIn()
    IndexPage.verifyOnPage().otherAgencyRegisterLink().click()
    AllOtherAgencies.verifyOnPage().viewOtherAgencyLink(office.agencyId).click()
  })

  it('will show update links for every editable field and add links for addresses, phone numbers and emails', () => {
    const details = OtherAgencyDetails.verifyOnPage(office.agencyName)
    ;[
      ['update-name-link', 'name-description'],
      ['update-description-link', 'name-description'],
      ['update-active-link', 'active'],
      ['update-inactive-date-link', 'active'],
      ['update-agency-type-link', 'agency-type'],
      ['update-cjit-code-link', 'cjit-code'],
      ['update-accessible-access-link', 'accessible-access'],
      ['update-area-link', 'area'],
      ['update-region-link', 'region'],
      ['update-geographical-area-link', 'geographical-area'],
      ['update-local-authority-link', 'local-authority'],
      ['update-payroll-region-link', 'payroll-region'],
    ].forEach(([qa, path]) => {
      details.link(qa).should('have.attr', 'href', `/other-agency-register/${path}/update?id=SHFPECS`)
    })
    const base = '/other-agency-register'
    details.link('add-address-link').should('have.attr', 'href', `${base}/address/create?id=SHFPECS`)
    details.link('update-address-link').should('have.attr', 'href', `${base}/address/update?id=SHFPECS&addressId=1`)
    details.link('add-phone-number-link').should('have.attr', 'href', `${base}/phone/create?id=SHFPECS`)
    details.link('update-phone-number-link').should('have.attr', 'href', `${base}/phone/update?id=SHFPECS&phoneId=7`)
    details.link('add-email-address-link').should('have.attr', 'href', `${base}/email/create?id=SHFPECS`)
    details.link('update-email-address-link').should('have.attr', 'href', `${base}/email/update?id=SHFPECS&emailId=3`)
    ;['delete-address-link', 'delete-phone-number-link', 'delete-email-address-link'].forEach(qa =>
      details.link(qa).should('exist'),
    )
  })

  it('will update the name and description, keeping all other fields', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.agencyName)
    page.name().should('have.value', office.agencyName)
    page.name().clear().type('Sheffield PECS Centre')
    page.description().clear()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName)
      .confirmUpdated()
      .should('contain.text', 'Other agency has been updated')
    updatedOffices().should('deep.equal', [
      { ...unchangedFields, agencyName: 'Sheffield PECS Centre', description: '' },
    ])
  })

  it('will require a name', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.agencyName)
    page.name().clear()
    page.saveButton().click()

    UpdateAgencyNameDescription.verifyOnPage(office.agencyName)
    cy.get('.govuk-error-summary').should('be.visible')
    updatedOffices().should('be.empty')
  })

  it('will reactivate the other agency and drop the deactivation date', () => {
    openUpdatePage('update-active-link')
    const page = UpdateAgencyActive.verifyOnPage(office.agencyName)
    page.inactive().should('be.checked')
    page.day().should('have.value', '1')
    page.active().check()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    const { inactiveDate, ...withoutInactiveDate } = unchangedFields
    updatedOffices().should('deep.equal', [{ ...withoutInactiveDate, active: true }])
  })

  it('will update and validate the CJIT code', () => {
    openUpdatePage('update-cjit-code-link')
    const page = UpdateAgencyCjitCode.verifyOnPage(office.agencyName)
    page.cjitCode().clear().type('TOOLONG99')
    page.saveButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'CJIT code must be 7 characters or fewer')
    updatedOffices().should('be.empty')

    const retry = UpdateAgencyCjitCode.verifyOnPage(office.agencyName)
    retry.cjitCode().clear().type('C00NEW1')
    retry.saveButton().click()
    OtherAgencyDetails.verifyOnPage(office.agencyName)
    updatedOffices().should('deep.equal', [{ ...unchangedFields, cjitCode: 'C00NEW1' }])
  })

  it('will update the agency type', () => {
    openUpdatePage('update-agency-type-link')
    const page = UpdateAgencyType.verifyOnPage(office.agencyName)
    page.option('PECS').should('be.checked')
    page.option('AIRPORT').check()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, otherAgencyType: 'AIRPORT' }])
  })

  it('will update the accessible access', () => {
    openUpdatePage('update-accessible-access-link')
    const page = UpdateAgencyAccessibleAccess.verifyOnPage(office.agencyName)
    page.option('ACCESSIBLE').should('be.checked')
    page.option('WHEELCHAIR_ACCESS').check()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, accessibleAccess: 'WHEELCHAIR_ACCESS' }])
  })

  it('will update the area using the autocomplete', () => {
    openUpdatePage('update-area-link')
    const page = UpdateAgencyArea.verifyOnPage(office.agencyName)
    page.area().should('have.value', areas[0].description)
    page.area().clear()
    page.area().type('South')
    page.suggestions().contains('South Yorkshire').click()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will show the API error and keep the entered values', () => {
    cy.task('stubOtherAgencyApiError', {
      ...officeCall('', 'PUT'),
      userMessage: 'Name already in use',
    })
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.agencyName)
    page.name().clear().type('Duplicate')
    page.saveButton().click()

    cy.get('.govuk-error-summary').should('contain.text', 'Name already in use')
    UpdateAgencyNameDescription.verifyOnPage(office.agencyName).name().should('have.value', 'Duplicate')
  })

  it('will cancel without saving', () => {
    openUpdatePage('update-name-link')
    UpdateAgencyNameDescription.verifyOnPage(office.agencyName).cancelLink().click()
    OtherAgencyDetails.verifyOnPage(office.agencyName)
    updatedOffices().should('be.empty')
  })

  it('will add an address', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('address', 'POST'), jsonBody: office.addresses[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('add-address-link').click()
    const page = AddAgencyAddress.verifyOnPage(office.agencyName)
    page.addressLine1().type('1 New Road')
    page.town().type('Sheffield')
    page.postcode().type('S1 2BJ')
    page.country('England').check()
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('address', 'POST')).should('have.length', 1)
  })

  it('will update an address', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('address/1', 'PUT'), jsonBody: office.addresses[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('update-address-link').click()
    const page = UpdateAgencyAddress.verifyOnPage(office.agencyName)
    page.addressLine1().should('have.value', 'Shoreham Street')
    page.addressLine1().clear().type('2 Shoreham Street')
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('address/1', 'PUT')).should('have.length', 1)
  })

  it('will add a phone number', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('phone-number', 'POST'), jsonBody: office.phoneNumbers[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('add-phone-number-link').click()
    const page = AddAgencyPhone.verifyOnPage(office.agencyName)
    page.phoneNumber().type('0114 000 1111')
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('phone-number', 'POST')).should('deep.equal', [
      { number: '0114 000 1111' },
    ])
  })

  it('will update a phone number and reject invalid numbers', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('phone-number/7', 'PUT'), jsonBody: office.phoneNumbers[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('update-phone-number-link').click()
    const page = UpdateAgencyPhone.verifyOnPage(office.agencyName)
    page.phoneNumber().should('have.value', '0114 220 2020')
    page.phoneNumber().clear().type('abc')
    page.saveButton().click()
    UpdateAgencyPhone.verifyOnPage(office.agencyName)
      .phoneNumberError()
      .should('contain.text', 'Enter a phone number using only numbers')

    const retry = UpdateAgencyPhone.verifyOnPage(office.agencyName)
    retry.phoneNumber().clear().type('0114 999 8888')
    retry.saveButton().click()
    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('phone-number/7', 'PUT')).should('deep.equal', [
      { number: '0114 999 8888' },
    ])
  })

  it('will add an email address', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('email-address', 'POST'), jsonBody: office.emailAddresses[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('add-email-address-link').click()
    const page = AddAgencyEmail.verifyOnPage(office.agencyName)
    page.emailAddress().type('new@example.com')
    page.saveButton().click()

    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('email-address', 'POST')).should('deep.equal', [
      { address: 'new@example.com' },
    ])
  })

  it('will update an email address and reject invalid addresses', () => {
    cy.task('stubOtherAgencyApi', { ...officeCall('email-address/3', 'PUT'), jsonBody: office.emailAddresses[0] })
    OtherAgencyDetails.verifyOnPage(office.agencyName).link('update-email-address-link').click()
    const page = UpdateAgencyEmail.verifyOnPage(office.agencyName)
    page.emailAddress().should('have.value', 'custody@example.com')
    page.emailAddress().clear().type('not-an-email')
    page.saveButton().click()
    UpdateAgencyEmail.verifyOnPage(office.agencyName)
      .emailAddressError()
      .should('contain.text', 'Enter a valid email address')

    const retry = UpdateAgencyEmail.verifyOnPage(office.agencyName)
    retry.emailAddress().clear().type('updated@example.com')
    retry.saveButton().click()
    OtherAgencyDetails.verifyOnPage(office.agencyName).confirmUpdated().should('exist')
    cy.task('getOtherAgencyApiRequests', officeCall('email-address/3', 'PUT')).should('deep.equal', [
      { address: 'updated@example.com' },
    ])
  })
})
