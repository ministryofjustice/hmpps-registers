import type { Page } from '../page'
import page from '../page'

const prisonDetails = {
  saveButton: () => cy.contains('Save'),
  id: () => cy.get('#id'),
  name: () => cy.get('#name'),
  maleCheckbox: () => cy.get('input[value="male"]'),
  femaleCheckbox: () => cy.get('input[value="female"]'),
  contractedRadioYes: () => cy.get('input#contracted[name="contracted"][value="yes"]'),
  contractedRadioNo: () => cy.get('input#contracted-2[name="contracted"][value="no"]'),
  lthseRadioYes: () => cy.get('input#lthse[name="lthse"][value="yes"]'),
  hmpCheckbox: () => cy.get('input[value="HMP"]'),
  yoiCheckbox: () => cy.get('input[value="YOI"]'),
  stcCheckbox: () => cy.get('input[value="STC"]'),
  ircCheckbox: () => cy.get('input[value="IRC"]'),
  ycsCheckbox: () => cy.get('input[value="YCS"]'),

  errorSummary: () => cy.get('.govuk-error-summary'),
}
const verifyOnPage = (prisonId: string): typeof prisonDetails & Page =>
  page(`Amend prison - main details for ${prisonId}`, prisonDetails)

export default { verifyOnPage }
