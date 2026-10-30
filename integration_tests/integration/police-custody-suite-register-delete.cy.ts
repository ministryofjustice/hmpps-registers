import AllPoliceCustodySuites from '../pages/police-custody-suite-register/allPoliceCustodySuites'
import PoliceCustodySuiteDetails from '../pages/police-custody-suite-register/policeCustodySuiteDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import DeleteAgencyPhone from '../pages/components/edit/deleteAgencyPhone'
import DeleteAgencyEmail from '../pages/components/edit/deleteAgencyEmail'
import policeCustodySuiteData from '../../server/routes/testutils/mockPoliceCustodySuiteData'
import courtData from '../../server/routes/testutils/mockCourtData'

const suite = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'SHFPCS',
  policeCustodySuiteName: 'Sheffield Police Custody Suite',
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
  emailAddresses: [
    { id: 8, address: 'first@example.com' },
    { id: 9, address: 'second@example.com' },
  ],
})
const otherSuite = policeCustodySuiteData.policeCustodySuite({
  policeCustodySuiteId: 'OTHER',
  policeCustodySuiteName: 'Other Police Custody Suite',
})

const deleteCall = (endpoint = '') => ({
  policeCustodySuiteId: suite.policeCustodySuiteId,
  endpoint,
  method: 'DELETE',
})
const deleteRequests = (endpoint = '') => cy.task('getPoliceCustodySuiteApiRequests', deleteCall(endpoint))

context('Police custody suite register - delete police custody suite, address, phone number and email', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetPoliceCustodySuites', [suite, otherSuite])
    cy.task('stubGetPoliceCustodySuite', suite)
    cy.task('stubPoliceCustodySuiteApi', { ...deleteCall(), status: 204 })
    cy.task('stubPoliceCustodySuiteApi', { ...deleteCall('address/2'), status: 204 })
    cy.task('stubPoliceCustodySuiteApi', { ...deleteCall('phone-number/5'), status: 204 })
    cy.task('stubPoliceCustodySuiteApi', { ...deleteCall('email-address/9'), status: 204 })
    cy.signIn()
    cy.visit(`/police-custody-suite-register/details?id=${suite.policeCustodySuiteId}`)
  })

  it('shows the suite on the confirmation page without deleting it, and cancels safely', () => {
    const details = PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    details
      .deletePoliceCustodySuiteButton()
      .should('contain.text', 'Delete police custody suite')
      .and('have.class', 'govuk-button--warning')
    details.deletePoliceCustodySuiteButton().click()

    const confirmation = DeleteAgency.verifyOnPage(suite.policeCustodySuiteName)
    confirmation.agencyDetails().should('contain.text', 'SHFPCS').and('contain.text', suite.policeCustodySuiteName)
    confirmation.cancelLink().should('have.attr', 'href', '/police-custody-suite-register/details?id=SHFPCS').click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    deleteRequests().should('be.empty')
  })

  it('deletes the police custody suite and returns to the register', () => {
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).deletePoliceCustodySuiteButton().click()
    cy.task('stubGetPoliceCustodySuites', [otherSuite])
    DeleteAgency.verifyOnPage(suite.policeCustodySuiteName).deleteButton().click()

    AllPoliceCustodySuites.verifyOnPage().viewPoliceCustodySuiteLink(otherSuite.policeCustodySuiteId).should('exist')
    cy.get(`[href="/police-custody-suite-register/details?id=${suite.policeCustodySuiteId}"]`).should('not.exist')
    deleteRequests().should('have.length', 1)
  })

  it('deletes only the selected address', () => {
    const details = PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName)
    details.link('delete-address-link').should('have.length', 2)
    details.link('delete-address-link').eq(1).click()

    cy.get('[data-qa=main-heading]').should('have.text', `Delete address for ${suite.policeCustodySuiteName}`)
    cy.get('[data-qa=address-details-section]')
      .should('contain.text', '1 High Street')
      .and('not.contain.text', '50 West Bar')
    deleteRequests('address/2').should('be.empty')

    cy.task('stubGetPoliceCustodySuite', { ...suite, addresses: [suite.addresses[0]] })
    cy.contains('button', 'Delete address').click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    deleteRequests('address/2').should('have.length', 1)
    deleteRequests('address/1').should('be.empty')
  })

  it('deletes only the selected phone number', () => {
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('delete-phone-number-link').eq(1).click()
    const confirmation = DeleteAgencyPhone.verifyOnPage(suite.policeCustodySuiteName)
    confirmation
      .phoneNumber()
      .invoke('text')
      .then(t => expect(t.trim()).to.equal('0114 222 2222'))
    deleteRequests('phone-number/5').should('be.empty')

    cy.task('stubGetPoliceCustodySuite', { ...suite, phoneNumbers: [suite.phoneNumbers[0]] })
    confirmation.deleteButton().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    deleteRequests('phone-number/5').should('have.length', 1)
    deleteRequests('phone-number/4').should('be.empty')
  })

  it('deletes only the selected email address', () => {
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).link('delete-email-address-link').eq(1).click()
    const confirmation = DeleteAgencyEmail.verifyOnPage(suite.policeCustodySuiteName)
    confirmation
      .emailAddress()
      .invoke('text')
      .then(t => expect(t.trim()).to.equal('second@example.com'))
    deleteRequests('email-address/9').should('be.empty')

    cy.task('stubGetPoliceCustodySuite', { ...suite, emailAddresses: [suite.emailAddresses[0]] })
    confirmation.deleteButton().click()
    PoliceCustodySuiteDetails.verifyOnPage(suite.policeCustodySuiteName).confirmUpdated().should('exist')
    deleteRequests('email-address/9').should('have.length', 1)
    deleteRequests('email-address/8').should('be.empty')
  })
})
