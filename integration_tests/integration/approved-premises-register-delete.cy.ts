import AllApprovedPremises from '../pages/approved-premises-register/allApprovedPremises'
import ApprovedPremisesDetails from '../pages/approved-premises-register/approvedPremisesDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import approvedPremisesData from '../../server/routes/testutils/mockApprovedPremisesData'

const office = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'SHFAP',
  approvedPremisesName: 'Sheffield Approved Premises',
})
const otherOffice = approvedPremisesData.approvedPremises({
  approvedPremisesId: 'OTHER',
  approvedPremisesName: 'Other approved premises',
})

const deleteCall = { approvedPremisesId: office.approvedPremisesId, endpoint: '', method: 'DELETE' }
const deleteRequests = () => cy.task('getApprovedPremisesApiRequests', deleteCall)

context('Approved premises register - delete approved premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetAllApprovedPremises', [office, otherOffice])
    cy.task('stubGetApprovedPremises', office)
    cy.task('stubApprovedPremisesApi', { ...deleteCall, status: 204 })
    cy.signIn()
    cy.visit(`/approved-premises-register/details?id=${office.approvedPremisesId}`)
  })

  it('shows the confirmation page without deleting, and cancels safely', () => {
    const details = ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
    details
      .deleteApprovedPremisesButton()
      .should('contain.text', 'Delete approved premises')
      .and('have.class', 'govuk-button--warning')
    details.deleteApprovedPremisesButton().click()

    const confirmation = DeleteAgency.verifyOnPage(office.approvedPremisesName)
    confirmation.agencyDetails().should('contain.text', 'SHFAP').and('contain.text', office.approvedPremisesName)
    confirmation.cancelLink().should('have.attr', 'href', '/approved-premises-register/details?id=SHFAP').click()
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName)
    deleteRequests().should('be.empty')
  })

  it('deletes the approved premises and returns to the register', () => {
    ApprovedPremisesDetails.verifyOnPage(office.approvedPremisesName).deleteApprovedPremisesButton().click()
    cy.task('stubGetAllApprovedPremises', [otherOffice])
    DeleteAgency.verifyOnPage(office.approvedPremisesName).deleteButton().click()

    AllApprovedPremises.verifyOnPage().viewApprovedPremisesLink(otherOffice.approvedPremisesId).should('exist')
    cy.get(`[href="/approved-premises-register/details?id=${office.approvedPremisesId}"]`).should('not.exist')
    deleteRequests().should('have.length', 1)
  })
})
