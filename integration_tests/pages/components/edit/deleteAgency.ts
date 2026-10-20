import page, { Page } from '../../page'

const deleteAgency = {
  agencyDetails: () => cy.get('[data-qa=agency-details-section]'),
  deleteButton: () => cy.get('[data-qa=delete-agency-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (agencyName: string): typeof deleteAgency & Page => page(`Delete ${agencyName}`, deleteAgency)

export default { verifyOnPage }
