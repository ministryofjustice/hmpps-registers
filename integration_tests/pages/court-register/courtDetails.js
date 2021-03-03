const page = require('../page')

const courtDetails = courtName =>
  page(courtName, {
    markAsClosedButton: () => cy.get('[data-qa=mark-as-closed]'),
    markAsOpenButton: () => cy.get('[data-qa=mark-as-open]'),
    activatedConfirmationBlock: () => cy.get('[data-qa=confirm-activation]'),
    deactivatedConfirmationBlock: () => cy.get('[data-qa=confirm-deactivation]'),
  })

module.exports = { verifyOnPage: courtDetails }
