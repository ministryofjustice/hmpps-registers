import AllProbationOffices from '../pages/probation-office-register/allProbationOffices'
import ProbationOfficeDetails from '../pages/probation-office-register/probationOfficeDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import probationOfficeData from '../../server/routes/testutils/mockProbationOfficeData'

const office = probationOfficeData.probationOffice({
  probationOfficeId: 'SHFPO',
  probationOfficeName: 'Sheffield Probation Office',
})
const otherOffice = probationOfficeData.probationOffice({
  probationOfficeId: 'OTHER',
  probationOfficeName: 'Other probation office',
})

const deleteCall = { probationOfficeId: office.probationOfficeId, endpoint: '', method: 'DELETE' }
const deleteRequests = () => cy.task('getProbationOfficeApiRequests', deleteCall)

context('Probation office register - delete probation office', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetProbationOffices', [office, otherOffice])
    cy.task('stubGetProbationOffice', office)
    cy.task('stubProbationOfficeApi', { ...deleteCall, status: 204 })
    cy.signIn()
    cy.visit(`/probation-office-register/details?id=${office.probationOfficeId}`)
  })

  it('shows the confirmation page without deleting, and cancels safely', () => {
    const details = ProbationOfficeDetails.verifyOnPage(office.probationOfficeName)
    details
      .deleteProbationOfficeButton()
      .should('contain.text', 'Delete probation office')
      .and('have.class', 'govuk-button--warning')
    details.deleteProbationOfficeButton().click()

    const confirmation = DeleteAgency.verifyOnPage(office.probationOfficeName)
    confirmation.agencyDetails().should('contain.text', 'SHFPO').and('contain.text', office.probationOfficeName)
    confirmation.cancelLink().should('have.attr', 'href', '/probation-office-register/details?id=SHFPO').click()
    ProbationOfficeDetails.verifyOnPage(office.probationOfficeName)
    deleteRequests().should('be.empty')
  })

  it('deletes the probation office and returns to the register', () => {
    ProbationOfficeDetails.verifyOnPage(office.probationOfficeName).deleteProbationOfficeButton().click()
    cy.task('stubGetProbationOffices', [otherOffice])
    DeleteAgency.verifyOnPage(office.probationOfficeName).deleteButton().click()

    AllProbationOffices.verifyOnPage().viewProbationOfficeLink(otherOffice.probationOfficeId).should('exist')
    cy.get(`[href="/probation-office-register/details?id=${office.probationOfficeId}"]`).should('not.exist')
    deleteRequests().should('have.length', 1)
  })
})
