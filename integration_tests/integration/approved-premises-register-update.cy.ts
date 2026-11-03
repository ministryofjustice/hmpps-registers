import { areas } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllApprovedPremises from '../pages/approved-premises-register/allApprovedPremises'
import ApprovedPremisesDetails from '../pages/approved-premises-register/approvedPremisesDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
import UpdateAgencyActive from '../pages/components/edit/updateAgencyActive'
import UpdateAgencyNameDescription from '../pages/components/edit/updateAgencyNameDescription'
import UpdateAgencyContact from '../pages/components/edit/updateAgencyContact'
import UpdateAgencyAccessibleAccess from '../pages/components/edit/updateAgencyAccessibleAccess'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import UpdateAgencyAddress from '../pages/components/edit/updateAgencyAddress'
import AddAgencyAddress from '../pages/components/edit/addAgencyAddress'
import UpdateAgencyPhone from '../pages/components/edit/updateAgencyPhone'
import AddAgencyPhone from '../pages/components/edit/addAgencyPhone'
import UpdateAgencyEmail from '../pages/components/edit/updateAgencyEmail'
import AddAgencyEmail from '../pages/components/edit/addAgencyEmail'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'
import courtData from '../../server/routes/testutils/mockCourtData'

const office = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFPO',
  approvedPremisesName: 'Sheffield Approved Premises',
  description: 'Sheffield City Centre Approved Premises',
  contact: 'Duty Officer',
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
  emailAddresses: [{ id: 3, address: 'premises@example.com' }],
})

const unchangedFields = {
  approvedPremisesName: office.approvedPremisesName,
  description: office.description,
  contact: 'Duty Officer',
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
  approvedPremisesId: office.approvedPremisesId,
  endpoint,
  method,
})
const updatedOffices = () => cy.task('getApprovedPremisesApiRequests', officeCall('', 'PUT'))
const openUpdatePage = (qa: string) => {
  ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link(qa).first().click()
}

context('Approved premises register - update approved premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [office])
    cy.task('stubGetApprovedPremises', office)
    cy.task('stubGetAreas', areas)
    cy.task('stubApprovedPremisesApi', { ...officeCall('', 'PUT'), jsonBody: office })
    cy.signIn()
    IndexPage.verifyOnPage().approvedPremisesRegisterLink().click()
    AllApprovedPremises.verifyOnPage().viewApprovedPremisesLink(office.approvedPremisesId).click()
  })

  it('will show update links for every editable field and add links for addresses, phone numbers and emails', () => {
    const details = ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
    ;[
      ['update-name-link', 'name-description'],
      ['update-description-link', 'name-description'],
      ['update-active-link', 'active'],
      ['update-inactive-date-link', 'active'],
      ['update-contact-link', 'contact'],
      ['update-cjit-code-link', 'cjit-code'],
      ['update-accessible-access-link', 'accessible-access'],
      ['update-area-link', 'area'],
      ['update-region-link', 'region'],
      ['update-geographical-area-link', 'geographical-area'],
      ['update-local-authority-link', 'local-authority'],
      ['update-payroll-region-link', 'payroll-region'],
    ].forEach(([qa, path]) => {
      details.link(qa).should('have.attr', 'href', `/approved-premises-register/${path}/update?id=SHFPO`)
    })
    const base = '/approved-premises-register'
    details.link('add-address-link').should('have.attr', 'href', `${base}/address/create?id=SHFPO`)
    details.link('update-address-link').should('have.attr', 'href', `${base}/address/update?id=SHFPO&addressId=1`)
    details.link('add-phone-number-link').should('have.attr', 'href', `${base}/phone/create?id=SHFPO`)
    details.link('update-phone-number-link').should('have.attr', 'href', `${base}/phone/update?id=SHFPO&phoneId=7`)
    details.link('add-email-address-link').should('have.attr', 'href', `${base}/email/create?id=SHFPO`)
    details.link('update-email-address-link').should('have.attr', 'href', `${base}/email/update?id=SHFPO&emailId=3`)
    ;['delete-address-link', 'delete-phone-number-link', 'delete-email-address-link'].forEach(qa =>
      details.link(qa).should('exist'),
    )
  })

  it('will update the name and description, keeping all other fields', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName)
    page.name().should('have.value', office.approvedPremisesName)
    page.name().clear().type('Sheffield Approved Premises Centre')
    page.description().clear()
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
      .confirmUpdated()
      .should('contain.text', 'Approved premises has been updated')
    updatedOffices().should('deep.equal', [
      { ...unchangedFields, approvedPremisesName: 'Sheffield Approved Premises Centre', description: '' },
    ])
  })

  it('will require a name', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName)
    page.name().clear()
    page.saveButton().click()

    UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName)
    cy.get('.govuk-error-summary').should('be.visible')
    updatedOffices().should('be.empty')
  })

  it('will reactivate the approved premises and drop the deactivation date', () => {
    openUpdatePage('update-active-link')
    const page = UpdateAgencyActive.verifyOnPage(office.approvedPremisesName)
    page.inactive().should('be.checked')
    page.day().should('have.value', '1')
    page.active().check()
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    const { inactiveDate, ...withoutInactiveDate } = unchangedFields
    updatedOffices().should('deep.equal', [{ ...withoutInactiveDate, active: true }])
  })

  it('will update and validate the CJIT code', () => {
    openUpdatePage('update-cjit-code-link')
    const page = UpdateAgencyCjitCode.verifyOnPage(office.approvedPremisesName)
    page.cjitCode().clear().type('TOOLONG99')
    page.saveButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'CJIT code must be 7 characters or fewer')
    updatedOffices().should('be.empty')

    const retry = UpdateAgencyCjitCode.verifyOnPage(office.approvedPremisesName)
    retry.cjitCode().clear().type('C00NEW1')
    retry.saveButton().click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
    updatedOffices().should('deep.equal', [{ ...unchangedFields, cjitCode: 'C00NEW1' }])
  })

  it('will update and validate the contact', () => {
    openUpdatePage('update-contact-link')
    const page = UpdateAgencyContact.verifyOnPage(office.approvedPremisesName)
    page.contact().should('have.value', 'Duty Officer')
    page.contact().clear().type('x'.repeat(81))
    page.saveButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'Contact must be 80 characters or fewer')
    updatedOffices().should('be.empty')

    const retry = UpdateAgencyContact.verifyOnPage(office.approvedPremisesName)
    retry.contact().clear().type('Front desk')
    retry.saveButton().click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, contact: 'Front desk' }])
  })

  it('will update the accessible access', () => {
    openUpdatePage('update-accessible-access-link')
    const page = UpdateAgencyAccessibleAccess.verifyOnPage(office.approvedPremisesName)
    page.option('ACCESSIBLE').should('be.checked')
    page.option('WHEELCHAIR_ACCESS').check()
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, accessibleAccess: 'WHEELCHAIR_ACCESS' }])
  })

  it('will update the area using the autocomplete', () => {
    openUpdatePage('update-area-link')
    const page = UpdateAgencyArea.verifyOnPage(office.approvedPremisesName)
    page.area().should('have.value', areas[0].description)
    page.area().clear()
    page.area().type('South')
    page.suggestions().contains('South Yorkshire').click()
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    updatedOffices().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will show the API error and keep the entered values', () => {
    cy.task('stubApprovedPremisesApiError', {
      ...officeCall('', 'PUT'),
      userMessage: 'Name already in use',
    })
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName)
    page.name().clear().type('Duplicate')
    page.saveButton().click()

    cy.get('.govuk-error-summary').should('contain.text', 'Name already in use')
    UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName).name().should('have.value', 'Duplicate')
  })

  it('will cancel without saving', () => {
    openUpdatePage('update-name-link')
    UpdateAgencyNameDescription.verifyOnPage(office.approvedPremisesName).cancelLink().click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
    updatedOffices().should('be.empty')
  })

  it('will add an address', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('address', 'POST'), jsonBody: office.addresses[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('add-address-link').click()
    const page = AddAgencyAddress.verifyOnPage(office.approvedPremisesName)
    page.addressLine1().type('1 New Road')
    page.town().type('Sheffield')
    page.postcode().type('S1 2BJ')
    page.country('England').check()
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('address', 'POST')).should('have.length', 1)
  })

  it('will update an address', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('address/1', 'PUT'), jsonBody: office.addresses[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('update-address-link').click()
    const page = UpdateAgencyAddress.verifyOnPage(office.approvedPremisesName)
    page.addressLine1().should('have.value', 'Shoreham Street')
    page.addressLine1().clear().type('2 Shoreham Street')
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('address/1', 'PUT')).should('have.length', 1)
  })

  it('will add a phone number', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('phone-number', 'POST'), jsonBody: office.phoneNumbers[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('add-phone-number-link').click()
    const page = AddAgencyPhone.verifyOnPage(office.approvedPremisesName)
    page.phoneNumber().type('0114 000 1111')
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('phone-number', 'POST')).should('deep.equal', [
      { number: '0114 000 1111' },
    ])
  })

  it('will update a phone number and reject invalid numbers', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('phone-number/7', 'PUT'), jsonBody: office.phoneNumbers[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('update-phone-number-link').click()
    const page = UpdateAgencyPhone.verifyOnPage(office.approvedPremisesName)
    page.phoneNumber().should('have.value', '0114 220 2020')
    page.phoneNumber().clear().type('abc')
    page.saveButton().click()
    UpdateAgencyPhone.verifyOnPage(office.approvedPremisesName)
      .phoneNumberError()
      .should('contain.text', 'Enter a phone number using only numbers')

    const retry = UpdateAgencyPhone.verifyOnPage(office.approvedPremisesName)
    retry.phoneNumber().clear().type('0114 999 8888')
    retry.saveButton().click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('phone-number/7', 'PUT')).should('deep.equal', [
      { number: '0114 999 8888' },
    ])
  })

  it('will add an email address', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('email-address', 'POST'), jsonBody: office.emailAddresses[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('add-email-address-link').click()
    const page = AddAgencyEmail.verifyOnPage(office.approvedPremisesName)
    page.emailAddress().type('new@example.com')
    page.saveButton().click()

    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('email-address', 'POST')).should('deep.equal', [
      { address: 'new@example.com' },
    ])
  })

  it('will update an email address and reject invalid addresses', () => {
    cy.task('stubApprovedPremisesApi', { ...officeCall('email-address/3', 'PUT'), jsonBody: office.emailAddresses[0] })
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).link('update-email-address-link').click()
    const page = UpdateAgencyEmail.verifyOnPage(office.approvedPremisesName)
    page.emailAddress().should('have.value', 'premises@example.com')
    page.emailAddress().clear().type('not-an-email')
    page.saveButton().click()
    UpdateAgencyEmail.verifyOnPage(office.approvedPremisesName)
      .emailAddressError()
      .should('contain.text', 'Enter a valid email address')

    const retry = UpdateAgencyEmail.verifyOnPage(office.approvedPremisesName)
    retry.emailAddress().clear().type('updated@example.com')
    retry.saveButton().click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).confirmUpdated().should('exist')
    cy.task('getApprovedPremisesApiRequests', officeCall('email-address/3', 'PUT')).should('deep.equal', [
      { address: 'updated@example.com' },
    ])
  })
})
