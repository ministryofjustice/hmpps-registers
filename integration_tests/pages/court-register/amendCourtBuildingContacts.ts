import type { Page } from '../page'
import page from '../page'

const contactDetails = {
  saveButton: () => cy.contains('Save'),
  removeButton: (index: number) => cy.get(`[data-qa=contact-details-section-${index}] .moj-add-another__remove-button`),
  number: (index: number) => cy.get(`#contacts\\[${index}\\]\\[number\\]`),
  type: (index: number) => cy.get(`#contacts\\[${index}\\]\\[type\\]`),
  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (buildingName: string): typeof contactDetails & Page =>
  page(`Amend court - contact details - ${buildingName}`, contactDetails)

export default { verifyOnPage }
