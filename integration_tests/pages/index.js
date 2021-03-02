const page = require('./page')

const indexPage = () =>
  page('HMPPS Registers', {
    headerUserName: () => cy.get('[data-qa=header-user-name]'),
    courtRegisterLink: () => cy.get('[href="/court-register"]'),
  })

module.exports = { verifyOnPage: indexPage }
