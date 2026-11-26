import page, { Page } from '../page'

const deleteDepartmentContactDetails = {
  details: () => cy.get('[data-qa=department-details-section]'),
  deleteButton: () => cy.get('[data-qa=delete-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (title: string): typeof deleteDepartmentContactDetails & Page =>
  page(title, deleteDepartmentContactDetails)

export default { verifyOnPage }
