import { areas } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllPoliceCustodySuites from '../pages/police-custody-suite-register/allPoliceCustodySuites'
import PoliceCustodySuiteDetails from '../pages/police-custody-suite-register/policeCustodySuiteDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
import UpdateAgencyActive from '../pages/components/edit/updateAgencyActive'
import UpdateAgencyNameDescription from '../pages/components/edit/updateAgencyNameDescription'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import UpdateAgencyAddress from '../pages/components/edit/updateAgencyAddress'
import AddAgencyAddress from '../pages/components/edit/addAgencyAddress'
import UpdateAgencyPhone from '../pages/components/edit/updateAgencyPhone'
import AddAgencyPhone from '../pages/components/edit/addAgencyPhone'
import UpdateAgencyEmail from '../pages/components/edit/updateAgencyEmail'
import AddAgencyEmail from '../pages/components/edit/addAgencyEmail'
import policeCustodySuiteData from '../../server/routes/testutils/mockPoliceCustodySuiteData'
import courtData from '../../server/routes/testutils/mockCourtData'

const suite = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'SHFPCS',
  policeCustodySuiteName: 'Sheffield Police Custody Suite',
  description: 'Sheffield City Centre Police Custody Suite',
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
  policeCustodySuiteName: suite.policeCustodySuiteName,
  description: suite.description,
  active: false,
  inactiveDate: '2023-01-01',
  cjitCode: 'C00SF00',
  areaCode: areas[0].code,
  regionCode: 'YOHUM',
  geographicalAreaCode: 'SYORKS',
  localAuthorityCode: '00CG',
  payrollRegionCode: 'NE',
}

const suiteCall = (endpoint: string, method: 'POST' | 'PUT') => ({
  policeCustodySuiteId: suite.policeCustodySuiteId,
  endpoint,
  method,
})
const updatedSuites = () => cy.task('getPoliceCustodySuiteApiRequests', suiteCall('', 'PUT'))
const openUpdatePage = (qa: string) => {
  PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link(qa).first().click()
}

context('Police custody suite register - update police custody suite', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPoliceCustodySuites', [suite])
    cy.task('stubGetPoliceCustodySuite', suite)
    cy.task('stubGetAreas', areas)
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('', 'PUT'), jsonBody: suite })
    cy.signIn()
    IndexPage.verifyOnPage().policeCustodySuiteRegisterLink().click()
    AllPoliceCustodySuites.verifyOnPage().viewPoliceCustodySuiteLink(suite.policeCustodySuiteId).click()
  })

  it('will show update links for every editable field and add links for addresses, phone numbers and emails', () => {
    const details = PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    ;[
      ['update-name-link', 'name-description'],
      ['update-description-link', 'name-description'],
      ['update-active-link', 'active'],
      ['update-inactive-date-link', 'active'],
      ['update-cjit-code-link', 'cjit-code'],
      ['update-area-link', 'area'],
      ['update-region-link', 'region'],
      ['update-geographical-area-link', 'geographical-area'],
      ['update-local-authority-link', 'local-authority'],
      ['update-payroll-region-link', 'payroll-region'],
    ].forEach(([qa, path]) => {
      details.link(qa).should('have.attr', 'href', `/police-custody-suite-register/${path}/update?id=SHFPCS`)
    })
    const base = '/police-custody-suite-register'
    details.link('add-address-link').should('have.attr', 'href', `${base}/address/create?id=SHFPCS`)
    details.link('update-address-link').should('have.attr', 'href', `${base}/address/update?id=SHFPCS&addressId=1`)
    details.link('delete-address-link').should('have.attr', 'href', `${base}/address/delete?id=SHFPCS&addressId=1`)
    details.link('add-phone-number-link').should('have.attr', 'href', `${base}/phone/create?id=SHFPCS`)
    details.link('update-phone-number-link').should('have.attr', 'href', `${base}/phone/update?id=SHFPCS&phoneId=7`)
    details.link('delete-phone-number-link').should('have.attr', 'href', `${base}/phone/delete?id=SHFPCS&phoneId=7`)
    details.link('add-email-address-link').should('have.attr', 'href', `${base}/email/create?id=SHFPCS`)
    details.link('update-email-address-link').should('have.attr', 'href', `${base}/email/update?id=SHFPCS&emailId=3`)
    details.link('delete-email-address-link').should('have.attr', 'href', `${base}/email/delete?id=SHFPCS&emailId=3`)
    details.deletePoliceCustodySuiteButton().should('have.attr', 'href', `${base}/delete?id=SHFPCS`)
  })

  it('will update the name and description, keeping all other fields', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName)
    page.name().should('have.value', suite.policeCustodySuiteName)
    page.name().clear().type('Sheffield Custody Suite')
    page.description().clear()
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
      .confirmUpdated()
      .should('contain.text', 'Police custody suite has been updated')
    updatedSuites().should('deep.equal', [
      { ...unchangedFields, policeCustodySuiteName: 'Sheffield Custody Suite', description: '' },
    ])
  })

  it('will require a name', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName)
    page.name().clear()
    page.saveButton().click()

    UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName)
    cy.get('.govuk-error-summary').should('be.visible')
    updatedSuites().should('be.empty')
  })

  it('will reactivate the police custody suite and drop the deactivation date', () => {
    openUpdatePage('update-active-link')
    const page = UpdateAgencyActive.verifyOnPage(suite.policeCustodySuiteName)
    page.inactive().should('be.checked')
    page.day().should('have.value', '1')
    page.active().check()
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    const { inactiveDate, ...withoutInactiveDate } = unchangedFields
    updatedSuites().should('deep.equal', [{ ...withoutInactiveDate, active: true }])
  })

  it('will update and validate the CJIT code', () => {
    openUpdatePage('update-cjit-code-link')
    const page = UpdateAgencyCjitCode.verifyOnPage(suite.policeCustodySuiteName)
    page.cjitCode().clear().type('TOOLONG99')
    page.saveButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'CJIT code must be 7 characters or fewer')
    updatedSuites().should('be.empty')

    const retry = UpdateAgencyCjitCode.verifyOnPage(suite.policeCustodySuiteName)
    retry.cjitCode().clear().type('C00NEW1')
    retry.saveButton().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    updatedSuites().should('deep.equal', [{ ...unchangedFields, cjitCode: 'C00NEW1' }])
  })

  it('will update the area using the autocomplete', () => {
    openUpdatePage('update-area-link')
    const page = UpdateAgencyArea.verifyOnPage(suite.policeCustodySuiteName)
    page.area().should('have.value', areas[0].description)
    page.area().clear()
    page.area().type('South')
    page.suggestions().contains('South Yorkshire').click()
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    updatedSuites().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will show the API error and keep the entered values', () => {
    cy.task('stubPoliceCustodySuiteApiError', {
      ...suiteCall('', 'PUT'),
      userMessage: 'Name already in use',
    })
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName)
    page.name().clear().type('Duplicate')
    page.saveButton().click()

    cy.get('.govuk-error-summary').should('contain.text', 'Name already in use')
    UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName).name().should('have.value', 'Duplicate')
  })

  it('will cancel without saving', () => {
    openUpdatePage('update-name-link')
    UpdateAgencyNameDescription.verifyOnPage(suite.policeCustodySuiteName).cancelLink().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    updatedSuites().should('be.empty')
  })

  it('will add an address', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('address', 'POST'), jsonBody: suite.addresses[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('add-address-link').click()
    const page = AddAgencyAddress.verifyOnPage(suite.policeCustodySuiteName)
    page.addressLine1().type('1 New Road')
    page.town().type('Sheffield')
    page.postcode().type('S1 2BJ')
    page.country('England').check()
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('address', 'POST')).should('have.length', 1)
  })

  it('will update an address', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('address/1', 'PUT'), jsonBody: suite.addresses[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('update-address-link').click()
    const page = UpdateAgencyAddress.verifyOnPage(suite.policeCustodySuiteName)
    page.addressLine1().should('have.value', 'Shoreham Street')
    page.addressLine1().clear().type('2 Shoreham Street')
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('address/1', 'PUT')).should('have.length', 1)
  })

  it('will add a phone number', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('phone-number', 'POST'), jsonBody: suite.phoneNumbers[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('add-phone-number-link').click()
    const page = AddAgencyPhone.verifyOnPage(suite.policeCustodySuiteName)
    page.phoneNumber().type('0114 000 1111')
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('phone-number', 'POST')).should('deep.equal', [
      { number: '0114 000 1111' },
    ])
  })

  it('will update a phone number and reject invalid numbers', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('phone-number/7', 'PUT'), jsonBody: suite.phoneNumbers[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('update-phone-number-link').click()
    const page = UpdateAgencyPhone.verifyOnPage(suite.policeCustodySuiteName)
    page.phoneNumber().should('have.value', '0114 220 2020')
    page.phoneNumber().clear().type('abc')
    page.saveButton().click()
    UpdateAgencyPhone.verifyOnPage(suite.policeCustodySuiteName)
      .phoneNumberError()
      .should('contain.text', 'Enter a phone number using only numbers')

    const retry = UpdateAgencyPhone.verifyOnPage(suite.policeCustodySuiteName)
    retry.phoneNumber().clear().type('0114 999 8888')
    retry.saveButton().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('phone-number/7', 'PUT')).should('deep.equal', [
      { number: '0114 999 8888' },
    ])
  })

  it('will add an email address', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('email-address', 'POST'), jsonBody: suite.emailAddresses[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('add-email-address-link').click()
    const page = AddAgencyEmail.verifyOnPage(suite.policeCustodySuiteName)
    page.emailAddress().type('new@example.com')
    page.saveButton().click()

    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('email-address', 'POST')).should('deep.equal', [
      { address: 'new@example.com' },
    ])
  })

  it('will update an email address and reject invalid addresses', () => {
    cy.task('stubPoliceCustodySuiteApi', { ...suiteCall('email-address/3', 'PUT'), jsonBody: suite.emailAddresses[0] })
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('update-email-address-link').click()
    const page = UpdateAgencyEmail.verifyOnPage(suite.policeCustodySuiteName)
    page.emailAddress().should('have.value', 'custody@example.com')
    page.emailAddress().clear().type('not-an-email')
    page.saveButton().click()
    UpdateAgencyEmail.verifyOnPage(suite.policeCustodySuiteName)
      .emailAddressError()
      .should('contain.text', 'Enter a valid email address')

    const retry = UpdateAgencyEmail.verifyOnPage(suite.policeCustodySuiteName)
    retry.emailAddress().clear().type('updated@example.com')
    retry.saveButton().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    cy.task('getPoliceCustodySuiteApiRequests', suiteCall('email-address/3', 'PUT')).should('deep.equal', [
      { address: 'updated@example.com' },
    ])
  })
})
