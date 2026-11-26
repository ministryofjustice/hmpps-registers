import AllOtherAgencies from '../pages/other-agency-register/allOtherAgencies'
import OtherAgencyDetails from '../pages/other-agency-register/otherAgencyDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import otherAgencyData from '../../server/routes/testutils/mockOtherAgencyData'

const office = otherAgencyData.otherAgency({
  agencyId: 'SHFAG',
  agencyName: 'Sheffield Agency',
})
const otherOffice = otherAgencyData.otherAgency({
  agencyId: 'OTHER',
  agencyName: 'Other other agency',
})

const deleteCall = { agencyId: office.agencyId, endpoint: '', method: 'DELETE' }
const deleteRequests = () => cy.task('getOtherAgencyApiRequests', deleteCall)

context('Other agency register - delete other agency', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetOtherAgencies', [office, otherOffice])
    cy.task('stubGetOtherAgency', office)
    cy.task('stubOtherAgencyApi', { ...deleteCall, status: 204 })
    cy.signIn()
    cy.visit(`/other-agency-register/details?id=${office.agencyId}`)
  })

  it('shows the confirmation page without deleting, and cancels safely', () => {
    const details = OtherAgencyDetails.verifyOnPage(office.agencyName)
    details
      .deleteOtherAgencyButton()
      .should('contain.text', 'Delete other agency')
      .and('have.class', 'govuk-button--warning')
    details.deleteOtherAgencyButton().click()

    const confirmation = DeleteAgency.verifyOnPage(office.agencyName)
    confirmation.agencyDetails().should('contain.text', 'SHFAG').and('contain.text', office.agencyName)
    confirmation.cancelLink().should('have.attr', 'href', '/other-agency-register/details?id=SHFAG').click()
    OtherAgencyDetails.verifyOnPage(office.agencyName)
    deleteRequests().should('be.empty')
  })

  it('deletes the other agency and returns to the register', () => {
    OtherAgencyDetails.verifyOnPage(office.agencyName).deleteOtherAgencyButton().click()
    cy.task('stubGetOtherAgencies', [otherOffice])
    DeleteAgency.verifyOnPage(office.agencyName).deleteButton().click()

    AllOtherAgencies.verifyOnPage().viewOtherAgencyLink(otherOffice.agencyId).should('exist')
    cy.get(`[href="/other-agency-register/details?id=${office.agencyId}"]`).should('not.exist')
    deleteRequests().should('have.length', 1)
  })
})
