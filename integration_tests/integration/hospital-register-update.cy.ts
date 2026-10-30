import { areas } from '../mockApis/referenceData'
import IndexPage from '../pages'
import AllHospitals from '../pages/hospital-register/allHospitals'
import HospitalDetails from '../pages/hospital-register/hospitalDetails'
import UpdateAgencyArea from '../pages/components/edit/updateAgencyArea'
import UpdateAgencyActive from '../pages/components/edit/updateAgencyActive'
import UpdateAgencyNameDescription from '../pages/components/edit/updateAgencyNameDescription'
import UpdateAgencyCjitCode from '../pages/components/edit/updateAgencyCjitCode'
import UpdateAgencyAddress from '../pages/components/edit/updateAgencyAddress'
import AddAgencyAddress from '../pages/components/edit/addAgencyAddress'
import UpdateAgencyPhone from '../pages/components/edit/updateAgencyPhone'
import AddAgencyPhone from '../pages/components/edit/addAgencyPhone'
import hospitalData from '../../server/routes/testutils/mockHospitalData'
import courtData from '../../server/routes/testutils/mockCourtData'

const hospital = hospitalData.hospital({
  hospitalId: 'RAMPTON',
  hospitalName: 'Rampton Secure Hospital',
  description: 'Rampton high security psychiatric hospital',
  active: false,
  inactiveDate: '2023-01-01',
  highSecurity: true,
  cjitCode: 'C00RA00',
  area: areas[0],
  region: { code: 'EM', description: 'East Midlands' },
  geographicalArea: { code: 'NOTTS', description: 'Nottinghamshire and Derbyshire' },
  localAuthority: { code: '37UB', description: 'Bassetlaw District Council' },
  payrollRegion: { code: 'MID', description: 'Midlands' },
  addresses: [
    courtData.address({
      id: 1,
      addressLine1: 'Woodbeck',
      town: 'Retford',
      postcode: 'DN22 0PD',
      country: 'England',
    }),
  ],
  phoneNumbers: [{ id: 7, number: '01777 248321' }],
})

const unchangedFields = {
  hospitalName: hospital.hospitalName,
  description: hospital.description,
  active: false,
  inactiveDate: '2023-01-01',
  highSecurity: true,
  cjitCode: 'C00RA00',
  areaCode: areas[0].code,
  regionCode: 'EM',
  geographicalAreaCode: 'NOTTS',
  localAuthorityCode: '37UB',
  payrollRegionCode: 'MID',
}

const hospitalCall = (endpoint: string, method: 'POST' | 'PUT') => ({
  hospitalId: hospital.hospitalId,
  endpoint,
  method,
})
const updatedHospitals = () => cy.task('getHospitalApiRequests', hospitalCall('', 'PUT'))
const openUpdatePage = (qa: string) => {
  HospitalDetails.verifyOnPage(hospital.hospitalName).link(qa).first().click()
}

context('Hospital register - update hospital', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetHospitals', [hospital])
    cy.task('stubGetHospital', hospital)
    cy.task('stubGetAreas', areas)
    cy.task('stubHospitalApi', { ...hospitalCall('', 'PUT'), jsonBody: hospital })
    cy.signIn()
    IndexPage.verifyOnPage().hospitalRegisterLink().click()
    AllHospitals.verifyOnPage().viewHospitalLink(hospital.hospitalId).click()
  })

  it('will show update links for every editable field and add links for addresses and phone numbers', () => {
    const details = HospitalDetails.verifyOnPage(hospital.hospitalName)
    ;[
      ['update-name-link', 'name-description'],
      ['update-description-link', 'name-description'],
      ['update-active-link', 'active'],
      ['update-inactive-date-link', 'active'],
      ['update-high-security-link', 'high-security'],
      ['update-cjit-code-link', 'cjit-code'],
      ['update-area-link', 'area'],
      ['update-region-link', 'region'],
      ['update-geographical-area-link', 'geographical-area'],
      ['update-local-authority-link', 'local-authority'],
      ['update-payroll-region-link', 'payroll-region'],
    ].forEach(([qa, path]) => {
      details.link(qa).should('have.attr', 'href', `/hospital-register/${path}/update?id=RAMPTON`)
    })
    details.link('add-address-link').should('have.attr', 'href', '/hospital-register/address/create?id=RAMPTON')
    details
      .link('update-address-link')
      .should('have.attr', 'href', '/hospital-register/address/update?id=RAMPTON&addressId=1')
    details
      .link('delete-address-link')
      .should('have.attr', 'href', '/hospital-register/address/delete?id=RAMPTON&addressId=1')
    details.link('add-phone-number-link').should('have.attr', 'href', '/hospital-register/phone/create?id=RAMPTON')
    details
      .link('update-phone-number-link')
      .should('have.attr', 'href', '/hospital-register/phone/update?id=RAMPTON&phoneId=7')
    details
      .link('delete-phone-number-link')
      .should('have.attr', 'href', '/hospital-register/phone/delete?id=RAMPTON&phoneId=7')
    details.deleteHospitalButton().should('have.attr', 'href', '/hospital-register/delete?id=RAMPTON')
  })

  it('will update the name and description, keeping all other fields', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName)
    page.name().should('have.value', hospital.hospitalName)
    page.name().clear().type('Rampton Hospital')
    page.description().clear()
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName)
      .confirmUpdated()
      .should('contain.text', 'Hospital has been updated')
    updatedHospitals().should('deep.equal', [{ ...unchangedFields, hospitalName: 'Rampton Hospital', description: '' }])
  })

  it('will require a name', () => {
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName)
    page.name().clear()
    page.saveButton().click()

    UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName)
    cy.get('.govuk-error-summary').should('be.visible')
    updatedHospitals().should('be.empty')
  })

  it('will reactivate the hospital and drop the deactivation date', () => {
    openUpdatePage('update-active-link')
    const page = UpdateAgencyActive.verifyOnPage(hospital.hospitalName)
    page.inactive().should('be.checked')
    page.day().should('have.value', '1')
    page.active().check()
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    const { inactiveDate, ...withoutInactiveDate } = unchangedFields
    updatedHospitals().should('deep.equal', [{ ...withoutInactiveDate, active: true }])
  })

  it('will update whether the hospital is high security', () => {
    openUpdatePage('update-high-security-link')
    cy.get('h1').should('contain.text', 'Update high security for Rampton Secure Hospital')
    cy.get('input[name=highSecurity][value=true]').should('be.checked')
    cy.get('input[name=highSecurity][value=false]').check()
    cy.get('[data-qa=continue-button]').click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    updatedHospitals().should('deep.equal', [{ ...unchangedFields, highSecurity: false }])
  })

  it('will require a high security selection', () => {
    cy.task('stubGetHospital', { ...hospital, highSecurity: undefined })
    openUpdatePage('update-high-security-link')
    cy.get('[data-qa=continue-button]').click()

    cy.get('#highSecurity-error').should('contain.text', 'Select whether the hospital is high security')
    updatedHospitals().should('be.empty')
  })

  it('will update and validate the CJIT code', () => {
    openUpdatePage('update-cjit-code-link')
    const page = UpdateAgencyCjitCode.verifyOnPage(hospital.hospitalName)
    page.cjitCode().clear().type('TOOLONG99')
    page.saveButton().click()
    cy.get('.govuk-error-summary').should('contain.text', 'CJIT code must be 7 characters or fewer')
    updatedHospitals().should('be.empty')

    const retry = UpdateAgencyCjitCode.verifyOnPage(hospital.hospitalName)
    retry.cjitCode().clear().type('C00NEW1')
    retry.saveButton().click()
    HospitalDetails.verifyOnPage(hospital.hospitalName)
    updatedHospitals().should('deep.equal', [{ ...unchangedFields, cjitCode: 'C00NEW1' }])
  })

  it('will update the area using the autocomplete', () => {
    openUpdatePage('update-area-link')
    const page = UpdateAgencyArea.verifyOnPage(hospital.hospitalName)
    page.area().should('have.value', areas[0].description)
    page.area().clear()
    page.area().type('South')
    page.suggestions().contains('South Yorkshire').click()
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    updatedHospitals().should('deep.equal', [{ ...unchangedFields, areaCode: 'SY' }])
  })

  it('will show the API error and keep the entered values', () => {
    cy.task('stubHospitalApiError', {
      ...hospitalCall('', 'PUT'),
      userMessage: 'Name already in use',
    })
    openUpdatePage('update-name-link')
    const page = UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName)
    page.name().clear().type('Duplicate')
    page.saveButton().click()

    cy.get('.govuk-error-summary').should('contain.text', 'Name already in use')
    UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName).name().should('have.value', 'Duplicate')
  })

  it('will cancel without saving', () => {
    openUpdatePage('update-name-link')
    UpdateAgencyNameDescription.verifyOnPage(hospital.hospitalName).cancelLink().click()
    HospitalDetails.verifyOnPage(hospital.hospitalName)
    updatedHospitals().should('be.empty')
  })

  it('will add an address', () => {
    cy.task('stubHospitalApi', { ...hospitalCall('address', 'POST'), jsonBody: hospital.addresses[0] })
    HospitalDetails.verifyOnPage(hospital.hospitalName).link('add-address-link').click()
    const page = AddAgencyAddress.verifyOnPage(hospital.hospitalName)
    page.addressLine1().type('1 New Road')
    page.town().type('Retford')
    page.postcode().type('DN22 7AA')
    page.country('England').check()
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    cy.task('getHospitalApiRequests', hospitalCall('address', 'POST')).should('have.length', 1)
  })

  it('will update an address', () => {
    cy.task('stubHospitalApi', { ...hospitalCall('address/1', 'PUT'), jsonBody: hospital.addresses[0] })
    HospitalDetails.verifyOnPage(hospital.hospitalName).link('update-address-link').click()
    const page = UpdateAgencyAddress.verifyOnPage(hospital.hospitalName)
    page.addressLine1().should('have.value', 'Woodbeck')
    page.addressLine1().clear().type('2 Woodbeck Lane')
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    cy.task('getHospitalApiRequests', hospitalCall('address/1', 'PUT')).should('have.length', 1)
  })

  it('will add a phone number', () => {
    cy.task('stubHospitalApi', { ...hospitalCall('phone-number', 'POST'), jsonBody: hospital.phoneNumbers[0] })
    HospitalDetails.verifyOnPage(hospital.hospitalName).link('add-phone-number-link').click()
    const page = AddAgencyPhone.verifyOnPage(hospital.hospitalName)
    page.phoneNumber().type('01777 000111')
    page.saveButton().click()

    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    cy.task('getHospitalApiRequests', hospitalCall('phone-number', 'POST')).should('deep.equal', [
      { number: '01777 000111' },
    ])
  })

  it('will update a phone number and reject invalid numbers', () => {
    cy.task('stubHospitalApi', { ...hospitalCall('phone-number/7', 'PUT'), jsonBody: hospital.phoneNumbers[0] })
    HospitalDetails.verifyOnPage(hospital.hospitalName).link('update-phone-number-link').click()
    const page = UpdateAgencyPhone.verifyOnPage(hospital.hospitalName)
    page.phoneNumber().should('have.value', '01777 248321')
    page.phoneNumber().clear().type('abc')
    page.saveButton().click()
    UpdateAgencyPhone.verifyOnPage(hospital.hospitalName)
      .phoneNumberError()
      .should('contain.text', 'Enter a phone number using only numbers')

    const retry = UpdateAgencyPhone.verifyOnPage(hospital.hospitalName)
    retry.phoneNumber().clear().type('01777 999888')
    retry.saveButton().click()
    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    cy.task('getHospitalApiRequests', hospitalCall('phone-number/7', 'PUT')).should('deep.equal', [
      { number: '01777 999888' },
    ])
  })
})
