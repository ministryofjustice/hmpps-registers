import AllHospitals from '../pages/hospital-register/allHospitals'
import HospitalDetails from '../pages/hospital-register/hospitalDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import DeleteAgencyPhone from '../pages/components/edit/deleteAgencyPhone'
import hospitalData from '../../server/routes/testutils/mockHospitalData'
import courtData from '../../server/routes/testutils/mockCourtData'

const hospital = hospitalData.hospital({
  hospitalId: 'SHEFH',
  hospitalName: 'Sheffield Hospital',
  addresses: [
    courtData.address({
      id: 1,
      addressLine1: '50 West Bar',
      town: 'Sheffield',
      postcode: 'S3 8PH',
      country: 'England',
    }),
    courtData.address({
      id: 2,
      addressLine1: '1 High Street',
      town: 'Sheffield',
      postcode: 'S1 2BJ',
      country: 'England',
    }),
  ],
  phoneNumbers: [
    { id: 4, number: '0114 111 1111' },
    { id: 5, number: '0114 222 2222' },
  ],
})
const otherHospital = hospitalData.hospital({ hospitalId: 'OTHER', hospitalName: 'Other Hospital' })

const deleteCall = (endpoint = '') => ({ hospitalId: hospital.hospitalId, endpoint, method: 'DELETE' })
const deleteRequests = (endpoint = '') => cy.task('getHospitalApiRequests', deleteCall(endpoint))

context('Hospital register - delete hospital, address and phone number', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetHospitals', [hospital, otherHospital])
    cy.task('stubGetHospital', hospital)
    cy.task('stubHospitalApi', { ...deleteCall(), status: 204 })
    cy.task('stubHospitalApi', { ...deleteCall('address/2'), status: 204 })
    cy.task('stubHospitalApi', { ...deleteCall('phone-number/5'), status: 204 })
    cy.signIn()
    cy.visit(`/hospital-register/details?id=${hospital.hospitalId}`)
  })

  it('shows the hospital on the confirmation page without deleting it, and cancels safely', () => {
    const details = HospitalDetails.verifyOnPage(hospital.hospitalName)
    details.deleteHospitalButton().should('contain.text', 'Delete hospital').and('have.class', 'govuk-button--warning')
    details.deleteHospitalButton().click()

    const confirmation = DeleteAgency.verifyOnPage(hospital.hospitalName)
    confirmation.agencyDetails().should('contain.text', 'SHEFH').and('contain.text', hospital.hospitalName)
    confirmation.cancelLink().should('have.attr', 'href', '/hospital-register/details?id=SHEFH').click()
    HospitalDetails.verifyOnPage(hospital.hospitalName)
    deleteRequests().should('be.empty')
  })

  it('deletes the hospital and returns to the register', () => {
    HospitalDetails.verifyOnPage(hospital.hospitalName).deleteHospitalButton().click()
    cy.task('stubGetHospitals', [otherHospital])
    DeleteAgency.verifyOnPage(hospital.hospitalName).deleteButton().click()

    AllHospitals.verifyOnPage().viewHospitalLink(otherHospital.hospitalId).should('exist')
    cy.get(`[href="/hospital-register/details?id=${hospital.hospitalId}"]`).should('not.exist')
    deleteRequests().should('have.length', 1)
  })

  it('deletes only the selected address', () => {
    const details = HospitalDetails.verifyOnPage(hospital.hospitalName)
    details.link('delete-address-link').should('have.length', 2)
    details.link('delete-address-link').eq(1).click()

    cy.get('[data-qa=main-heading]').should('have.text', `Delete address for ${hospital.hospitalName}`)
    cy.get('[data-qa=address-details-section]')
      .should('contain.text', '1 High Street')
      .and('not.contain.text', '50 West Bar')
    deleteRequests('address/2').should('be.empty')

    cy.task('stubGetHospital', { ...hospital, addresses: [hospital.addresses[0]] })
    cy.contains('button', 'Delete address').click()
    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    deleteRequests('address/2').should('have.length', 1)
    deleteRequests('address/1').should('be.empty')
  })

  it('deletes only the selected phone number', () => {
    HospitalDetails.verifyOnPage(hospital.hospitalName).link('delete-phone-number-link').eq(1).click()
    const confirmation = DeleteAgencyPhone.verifyOnPage(hospital.hospitalName)
    confirmation
      .phoneNumber()
      .invoke('text')
      .then(t => expect(t.trim()).to.equal('0114 222 2222'))
    deleteRequests('phone-number/5').should('be.empty')

    cy.task('stubGetHospital', { ...hospital, phoneNumbers: [hospital.phoneNumbers[0]] })
    confirmation.deleteButton().click()
    HospitalDetails.verifyOnPage(hospital.hospitalName).confirmUpdated().should('exist')
    deleteRequests('phone-number/5').should('have.length', 1)
    deleteRequests('phone-number/4').should('be.empty')
  })
})
