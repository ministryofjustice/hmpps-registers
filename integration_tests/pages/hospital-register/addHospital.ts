import page, { Page } from '../page'

const journeyControls = {
  backLink: () => cy.get('[data-qa=back-link]'),
  continueButton: () => cy.get('[data-qa=continue-button]'),
  cancelButton: () => cy.get('[data-qa=cancel-button]'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}

const details = {
  ...journeyControls,
  hospitalId: () => cy.get('#hospitalId'),
  hospitalIdError: () => cy.get('#hospitalId-error'),
  hospitalName: () => cy.get('#hospitalName'),
  hospitalNameError: () => cy.get('#hospitalName-error'),
  description: () => cy.get('#description'),
  descriptionError: () => cy.get('#description-error'),
}

const highSecurity = {
  ...journeyControls,
  option: (value: 'true' | 'false') => cy.get(`input[name=highSecurity][value="${value}"]`),
  checked: () => cy.get('input[name=highSecurity]:checked'),
  error: () => cy.get('#highSecurity-error'),
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
  'hospitalId' | 'hospitalName' | 'description' | 'highSecurity' | 'cjitCode' | ReferenceField

const changeLink = (field: CheckAnswersField) => cy.get(`[data-qa=change-${field}-link]`)

const checkAnswers = {
  ...journeyControls,
  changeLink,
  value: (field: CheckAnswersField) =>
    changeLink(field).closest('.govuk-summary-list__row').find('.govuk-summary-list__value'),
  createHospitalButton: () => cy.get('[data-qa=create-hospital-button]'),
}

export const referenceFieldTitles: Record<ReferenceField, string> = {
  area: 'Select area',
  region: 'Select region',
  geographicalArea: 'Select geographical area',
  localAuthority: 'Select local authority',
  payrollRegion: 'Select payroll region',
}

export const AddHospitalDetails = {
  verifyOnPage: (): typeof details & Page => page('Enter hospital details', details),
}
export const AddHospitalHighSecurity = {
  verifyOnPage: (): typeof highSecurity & Page => page('Select high security', highSecurity),
}
export const AddHospitalCjitCode = {
  verifyOnPage: (): typeof cjitCode & Page => page('Enter CJIT code', cjitCode),
}
export const AddHospitalReferenceData = {
  verifyOnPage: (field: ReferenceField): ReturnType<typeof referenceData> & Page =>
    page(referenceFieldTitles[field], referenceData(field)),
}
export const AddHospitalCheckAnswers = {
  verifyOnPage: (): typeof checkAnswers & Page => page('Check your answers before adding a hospital', checkAnswers),
}
