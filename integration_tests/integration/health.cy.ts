context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
    cy.task('stubPrisonRegisterPing')
  })

  it('Health check page is visible', () => {
    cy.request('/health').its('body.healthy').should('equal', true)
  })
  it('Ping is visible and UP', () => {
    cy.request('/ping').its('body.status').should('equal', 'UP')
  })
})
