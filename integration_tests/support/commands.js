Cypress.Commands.add('login', (options = { failOnStatusCode: true }) => {
  cy.request(`/`)
  cy.task('getLoginUrl').then(url => cy.visit(url, options))
})
