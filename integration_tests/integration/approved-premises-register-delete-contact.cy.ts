import ApprovedPremisesDetails from '../pages/approved-premises-register/approvedPremisesDetails'
import DeleteAgencyPhone from '../pages/components/edit/deleteAgencyPhone'
import DeleteAgencyEmail from '../pages/components/edit/deleteAgencyEmail'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'
import courtData from '../../server/routes/testutils/mockCourtData'

const entity = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFAP',
  approvedPremisesName: 'Sheffield Approved Premises',
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

const deleteCall = (endpoint = '') => ({ approvedPremisesId: entity.approvedPremisesId, endpoint, method: 'DELETE' })
const deleteRequests = (endpoint = '') => cy.task('getApprovedPremisesApiRequests', deleteCall(endpoint))

context('Approved premises register - delete address, phone number and email', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [entity])
    cy.task('stubGetApprovedPremises', entity)
    cy.task('stubApprovedPremisesApi', { ...deleteCall('address/2'), status: 204 })
    cy.task('stubApprovedPremisesApi', { ...deleteCall('phone-number/5'), status: 204 })
    cy.task('stubApprovedPremisesApi', { ...deleteCall('email-address/9'), status: 204 })
    cy.signIn()
    cy.visit(`/approved-premises-register/details?id=${entity.approvedPremisesId}`)
  })

  it('deletes only the selected address', () => {
    const details = ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName)
    details.link('delete-address-link').should('have.length', 2)
    details.link('delete-address-link').eq(1).click()

    cy.get('[data-qa=main-heading]').should('have.text', `Delete address for ${entity.approvedPremisesName}`)
    cy.get('[data-qa=address-details-section]')
      .should('contain.text', '1 High Street')
      .and('not.contain.text', '50 West Bar')
    deleteRequests('address/2').should('be.empty')

    cy.task('stubGetApprovedPremises', { ...entity, addresses: [entity.addresses[0]] })
    cy.contains('button', 'Delete address').click()
    ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName).confirmUpdated().should('exist')
    deleteRequests('address/2').should('have.length', 1)
    deleteRequests('address/1').should('be.empty')
  })

  it('deletes only the selected phone number', () => {
    ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName).link('delete-phone-number-link').eq(1).click()
    const confirmation = DeleteAgencyPhone.verifyOnPage(entity.approvedPremisesName)
    confirmation
      .phoneNumber()
      .invoke('text')
      .then(t => expect(t.trim()).to.equal('0114 222 2222'))
    deleteRequests('phone-number/5').should('be.empty')

    cy.task('stubGetApprovedPremises', { ...entity, phoneNumbers: [entity.phoneNumbers[0]] })
    confirmation.deleteButton().click()
    ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName).confirmUpdated().should('exist')
    deleteRequests('phone-number/5').should('have.length', 1)
    deleteRequests('phone-number/4').should('be.empty')
  })

  it('deletes only the selected email address', () => {
    ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName).link('delete-email-address-link').eq(1).click()
    const confirmation = DeleteAgencyEmail.verifyOnPage(entity.approvedPremisesName)
    confirmation
      .emailAddress()
      .invoke('text')
      .then(t => expect(t.trim()).to.equal('second@example.com'))
    deleteRequests('email-address/9').should('be.empty')

    cy.task('stubGetApprovedPremises', { ...entity, emailAddresses: [entity.emailAddresses[0]] })
    confirmation.deleteButton().click()
    ApprovedPremisesDetails.verifyOnPage(entity.approvedPremisesName).confirmUpdated().should('exist')
    deleteRequests('email-address/9').should('have.length', 1)
    deleteRequests('email-address/8').should('be.empty')
  })
})
