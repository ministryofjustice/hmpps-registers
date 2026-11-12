import page, { Page } from '../page'

const updatePrisonDetail = {
  name: () => cy.get('#name'),
  welshName: () => cy.get('#prisonNameInWelsh'),
  maleCheckbox: () => cy.get('input[value="male"]'),
  femaleCheckbox: () => cy.get('input[value="female"]'),
  hmpCheckbox: () => cy.get('input[value="HMP"]'),
  yoiCheckbox: () => cy.get('input[value="YOI"]'),
  stcCheckbox: () => cy.get('input[value="STC"]'),
  contractedYes: () => cy.get('input[name="contracted"][value="yes"]'),
  contractedNo: () => cy.get('input[name="contracted"][value="no"]'),
  lthseYes: () => cy.get('input[name="lthse"][value="yes"]'),
  lthseNo: () => cy.get('input[name="lthse"][value="no"]'),
  errorSummary: () => cy.get('[data-qa-errors]'),
  saveButton: () => cy.get('[data-qa=continue-button]'),
  cancelLink: () => cy.get('[data-qa=cancel-button]'),
}

const verifyOnPage = (title: string): typeof updatePrisonDetail & Page => page(title, updatePrisonDetail)

export default { verifyOnPage }
