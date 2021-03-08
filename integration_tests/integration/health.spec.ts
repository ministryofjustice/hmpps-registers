context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
    cy.task('stubCourtRegisterPing')
  })

  it('Health check page is visible', () => {
    cy.request('/health').its('body.healthy').should('equal', true)
  })
})
