import page, { Page } from '../page'

const journeyControls = {
  backLink: () => cy.get('[data-qa=back-link]'),
  continueButton: () => cy.get('[data-qa=continue-button]'),
  cancelButton: () => cy.get('[data-qa=cancel-button]'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}

const details = {
  ...journeyControls,
  policeCustodySuiteId: () => cy.get('#policeCustodySuiteId'),
  policeCustodySuiteIdError: () => cy.get('#policeCustodySuiteId-error'),
  policeCustodySuiteName: () => cy.get('#policeCustodySuiteName'),
  policeCustodySuiteNameError: () => cy.get('#policeCustodySuiteName-error'),
  description: () => cy.get('#description'),
  descriptionError: () => cy.get('#description-error'),
}

const cjitCode = {
  ...journeyControls,
  cjitCode: () => cy.get('#cjitCode'),
  error: () => cy.get('#cjitCode-error'),
}

const referenceData = (fieldId: string) => ({
  ...journeyControls,
  input: () => cy.get(`input#${fieldId}`),
  code: () => cy.get(`#${fieldId}Code`),
  suggestions: () => cy.get(`#${fieldId}__listbox .autocomplete__option`),
  error: () => cy.get(`#${fieldId}-error`),
})

export type ReferenceField = 'area' | 'region' | 'geographicalArea' | 'localAuthority' | 'payrollRegion'

export type CheckAnswersField =
  'policeCustodySuiteId' | 'policeCustodySuiteName' | 'description' | 'cjitCode' | ReferenceField

const changeLink = (field: CheckAnswersField) => cy.get(`[data-qa=change-${field}-link]`)

const checkAnswers = {
  ...journeyControls,
  changeLink,
  value: (field: CheckAnswersField) =>
    changeLink(field).closest('.govuk-summary-list__row').find('.govuk-summary-list__value'),
  createPoliceCustodySuiteButton: () => cy.get('[data-qa=create-police-custody-suite-button]'),
}

export const referenceFieldTitles: Record<ReferenceField, string> = {
  area: 'Select area',
  region: 'Select region',
  geographicalArea: 'Select geographical area',
  localAuthority: 'Select local authority',
  payrollRegion: 'Select payroll region',
}

export const AddPoliceCustodySuiteDetails = {
  verifyOnPage: (): typeof details & Page => page('Enter police custody suite details', details),
}
export const AddPoliceCustodySuiteCjitCode = {
  verifyOnPage: (): typeof cjitCode & Page => page('Enter CJIT code', cjitCode),
}
export const AddPoliceCustodySuiteReferenceData = {
  verifyOnPage: (field: ReferenceField): ReturnType<typeof referenceData> & Page =>
    page(referenceFieldTitles[field], referenceData(field)),
}
export const AddPoliceCustodySuiteCheckAnswers = {
  verifyOnPage: (): typeof checkAnswers & Page =>
    page('Check your answers before adding a police custody suite', checkAnswers),
}
