import CourtsDetails from '../pages/court-register/courtsDetails'
import courtData from '../../server/routes/testutils/mockCourtData'

const court = courtData.court({
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
})

const deletedRequests = (addressId: number) =>
  cy.task('getDeletedCourtAddressRequests', { courtId: court.courtId, addressId })

context('Court register - delete address', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubManageUser')
    cy.task('stubGetCourt', court)
    cy.task('stubDeleteCourtAddress', { courtId: court.courtId, addressId: 2 })
    cy.signIn()
    cy.visit(`/court-register/details?id=${court.courtId}`)
  })

  it('shows a delete link beside update for each address', () => {
    const details = CourtsDetails.verifyOnPage(court.courtName)
    details.deleteAddressLink().should('have.length', 2)
    details.deleteAddressLink().eq(1).should('have.attr', 'href', '/court-register/address/delete?id=SHFCC&addressId=2')
    details.updateAddressLink().eq(1).parent().parent().should('contain.text', 'Delete')
  })

  it('does not show delete links when there are no addresses', () => {
    cy.task('stubGetCourt', { ...court, addresses: [] })
    cy.reload()
    CourtsDetails.verifyOnPage(court.courtName).deleteAddressLink().should('not.exist')
  })

  it('shows the selected address without deleting and cancels without changing it', () => {
    CourtsDetails.verifyOnPage(court.courtName).deleteAddressLink().eq(1).click()
    cy.get('[data-qa=main-heading]').should('have.text', `Delete address for ${court.courtName}`)
    cy.get('.govuk-caption-l').should('have.text', 'Delete address')
    cy.get('[data-qa=address-details-section]')
      .should('contain.text', '1 High Street')
      .and('not.contain.text', '50 West Bar')
    cy.get('input[name=addressId]').should('have.value', '2')
    cy.contains('button', 'Delete address').should('have.class', 'govuk-button--warning')
    deletedRequests(2).should('equal', 0)
    cy.get('[data-qa=cancel-button]').click()
    CourtsDetails.verifyOnPage(court.courtName).address().should('have.length', 2)
    deletedRequests(2).should('equal', 0)
  })

  it('deletes only the selected address and returns with a success message', () => {
    CourtsDetails.verifyOnPage(court.courtName).deleteAddressLink().eq(1).click()
    cy.task('stubGetCourt', { ...court, addresses: [court.addresses[0]] })
    cy.contains('button', 'Delete address').click()
    cy.url().should('include', '/court-register/details?id=SHFCC&action=UPDATED')
    cy.get('[data-qa=confirm-updated]').should('contain.text', 'Court has been updated successfully')
    CourtsDetails.verifyOnPage(court.courtName).address().should('have.length', 1).and('contain.text', '50 West Bar')
    deletedRequests(2).should('equal', 1)
    deletedRequests(1).should('equal', 0)
  })
})
