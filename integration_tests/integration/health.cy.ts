context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
    cy.task('stubManageUsersPing')
    cy.task('stubPrisonRegisterPing')
  })

  it('Health check page is visible and UP', () => {
    cy.request('/health').its('body.status').should('equal', 'UP')
  })

  it('Ping is visible and UP', () => {
    cy.request('/ping').its('body.status').should('equal', 'UP')
  })
})
