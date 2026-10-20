import AllCourts from '../pages/court-register/allCourts'
import CourtsDetails from '../pages/court-register/courtsDetails'
import DeleteAgency from '../pages/components/edit/deleteAgency'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({ courtId: 'SHFCC', courtName: 'Sheffield Crown Court' })
const otherCourt = courtData.court({ courtId: 'OTHER', courtName: 'Other Court' })
const deleteRequests = (courtId = court.courtId) => cy.task('getDeletedCourtRequests', courtId)

context('Court register - delete court', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourts', [court, otherCourt])
    cy.task('stubGetCourt', court)
    cy.task('stubDeleteCourt', { courtId: court.courtId })
    cy.signIn()
    cy.visit(`/court-register/details?id=${court.courtId}`)
  })

  it('shows warning buttons and the selected court on the confirmation page without deleting it', () => {
    const details = CourtsDetails.verifyOnPage(court.courtName)
    details.deleteCourtButton().should('contain.text', 'Delete court').and('have.class', 'govuk-button--warning')
    details.deleteCourtButton().should('have.attr', 'href', '/court-register/delete?id=SHFCC').click()

    const confirmation = DeleteAgency.verifyOnPage(court.courtName)
    confirmation.agencyDetails().should('contain.text', court.courtId).and('contain.text', court.courtName)
    confirmation.deleteButton().should('contain.text', 'Delete').and('have.class', 'govuk-button--warning')
    confirmation.cancelLink().should('have.attr', 'href', '/court-register/details?id=SHFCC')
    cy.get('input[name=_csrf]').should('not.have.value', '')
    deleteRequests().should('equal', 0)
  })

  it('returns to the court details without deleting when cancelled', () => {
    CourtsDetails.verifyOnPage(court.courtName).deleteCourtButton().click()
    DeleteAgency.verifyOnPage(court.courtName).cancelLink().click()

    CourtsDetails.verifyOnPage(court.courtName)
    deleteRequests().should('equal', 0)
  })

  it('deletes only the selected court and returns to the register', () => {
    CourtsDetails.verifyOnPage(court.courtName).deleteCourtButton().click()
    cy.task('stubGetCourts', [otherCourt])
    DeleteAgency.verifyOnPage(court.courtName).deleteButton().click()

    AllCourts.verifyOnPage()
    cy.get(`[href="/court-register/details?id=${court.courtId}"]`).should('not.exist')
    AllCourts.verifyOnPage().viewCourtLink(otherCourt.courtId).should('exist')
    deleteRequests().should('equal', 1)
    deleteRequests(otherCourt.courtId).should('equal', 0)
  })

  it('does not report success when the delete endpoint fails', () => {
    cy.task('stubDeleteCourt', { courtId: court.courtId, status: 500 })
    CourtsDetails.verifyOnPage(court.courtName).deleteCourtButton().click()
    DeleteAgency.verifyOnPage(court.courtName).deleteButton().click()

    cy.location('pathname').should('equal', '/court-register/delete')
    cy.get('h1').should('contain.text', 'Internal Server Error')
  })

  it('rejects a deletion request without a CSRF token', () => {
    cy.request({
      method: 'POST',
      url: '/court-register/delete?id=SHFCC',
      failOnStatusCode: false,
      followRedirect: false,
      form: true,
      body: {},
    }).then(response => {
      expect(response.status).to.equal(302)
      expect(response.headers.location).to.equal('/sign-out')
    })
    deleteRequests().should('equal', 0)
  })
})
