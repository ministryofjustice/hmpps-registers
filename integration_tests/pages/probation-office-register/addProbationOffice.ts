import page, { Page } from '../page'

const journeyControls = {
  backLink: () => cy.get('[data-qa=back-link]'),
  continueButton: () => cy.get('[data-qa=continue-button]'),
  cancelButton: () => cy.get('[data-qa=cancel-button]'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}

const details = {
  ...journeyControls,
  probationOfficeId: () => cy.get('#probationOfficeId'),
  probationOfficeIdError: () => cy.get('#probationOfficeId-error'),
  probationOfficeName: () => cy.get('#probationOfficeName'),
  probationOfficeNameError: () => cy.get('#probationOfficeName-error'),
  description: () => cy.get('#description'),
  descriptionError: () => cy.get('#description-error'),
  contact: () => cy.get('#contact'),
  contactError: () => cy.get('#contact-error'),
}

const accessibleAccess = {
  ...journeyControls,
  option: (value: string) => cy.get(`input[name=accessibleAccess][value=${value}]`),
  error: () => cy.get('#accessibleAccess-error'),
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
  | 'probationOfficeId'
  | 'probationOfficeName'
  | 'description'
  | 'contact'
  | 'cjitCode'
  | 'accessibleAccess'
  | ReferenceField

const changeLink = (field: CheckAnswersField) => cy.get(`[data-qa=change-${field}-link]`)

const checkAnswers = {
  ...journeyControls,
  changeLink,
  value: (field: CheckAnswersField) =>
    changeLink(field).closest('.govuk-summary-list__row').find('.govuk-summary-list__value'),
  createProbationOfficeButton: () => cy.get('[data-qa=create-probation-office-button]'),
}

export const referenceFieldTitles: Record<ReferenceField, string> = {
  area: 'Select area',
  region: 'Select region',
  geographicalArea: 'Select geographical area',
  localAuthority: 'Select local authority',
  payrollRegion: 'Select payroll region',
}

export const AddProbationOfficeDetails = {
  verifyOnPage: (): typeof details & Page => page('Enter probation office details', details),
}
export const AddProbationOfficeCjitCode = {
  verifyOnPage: (): typeof cjitCode & Page => page('Enter CJIT code', cjitCode),
}
export const AddProbationOfficeAccessibleAccess = {
  verifyOnPage: (): typeof accessibleAccess & Page => page('Select accessible access', accessibleAccess),
}
export const AddProbationOfficeReferenceData = {
  verifyOnPage: (field: ReferenceField): ReturnType<typeof referenceData> & Page =>
    page(referenceFieldTitles[field], referenceData(field)),
}
export const AddProbationOfficeCheckAnswers = {
  verifyOnPage: (): typeof checkAnswers & Page =>
    page('Check your answers before adding a probation office', checkAnswers),
}
