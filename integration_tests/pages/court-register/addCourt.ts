import page, { Page } from '../page'

const journeyControls = {
  backLink: () => cy.get('[data-qa=back-link]'),
  continueButton: () => cy.get('[data-qa=continue-button]'),
  cancelButton: () => cy.get('[data-qa=cancel-button]'),
  errorSummary: () => cy.get('.govuk-error-summary'),
}

const details = {
  ...journeyControls,
  courtId: () => cy.get('#courtId'),
  courtIdError: () => cy.get('#courtId-error'),
  courtName: () => cy.get('#courtName'),
  courtNameError: () => cy.get('#courtName-error'),
  description: () => cy.get('#description'),
  descriptionError: () => cy.get('#description-error'),
}

const courtType = {
  ...journeyControls,
  options: () => cy.get('input[name=courtType]'),
  option: (code: string) => cy.get(`input[name=courtType][value="${code}"]`),
  checked: () => cy.get('input[name=courtType]:checked'),
  error: () => cy.get('#courtType-error'),
}

const accessibleAccess = {
  ...journeyControls,
  options: () => cy.get('input[name=accessibleAccess]'),
  option: (value: string) => cy.get(`input[name=accessibleAccess][value="${value}"]`),
  checked: () => cy.get('input[name=accessibleAccess]:checked'),
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
  'courtId' | 'courtName' | 'description' | 'courtType' | 'accessibleAccess' | 'cjitCode' | ReferenceField

const changeLink = (field: CheckAnswersField) => cy.get(`[data-qa=change-${field}-link]`)

const checkAnswers = {
  ...journeyControls,
  changeLink,
  value: (field: CheckAnswersField) =>
    changeLink(field).closest('.govuk-summary-list__row').find('.govuk-summary-list__value'),
  createCourtButton: () => cy.get('[data-qa=create-court-button]'),
}

export const referenceFieldTitles: Record<ReferenceField, string> = {
  area: 'Select area',
  region: 'Select region',
  geographicalArea: 'Select geographical area',
  localAuthority: 'Select local authority',
  payrollRegion: 'Select payroll region',
}

export const AddCourtDetails = {
  verifyOnPage: (): typeof details & Page => page('Enter court details', details),
}
export const AddCourtType = {
  verifyOnPage: (): typeof courtType & Page => page('Select court type', courtType),
}
export const AddCourtAccessibleAccess = {
  verifyOnPage: (): typeof accessibleAccess & Page => page('Select accessible access', accessibleAccess),
}
export const AddCourtCjitCode = {
  verifyOnPage: (): typeof cjitCode & Page => page('Enter CJIT code', cjitCode),
}
export const AddCourtReferenceData = {
  verifyOnPage: (field: ReferenceField): ReturnType<typeof referenceData> & Page =>
    page(referenceFieldTitles[field], referenceData(field)),
}
export const AddCourtCheckAnswers = {
  verifyOnPage: (): typeof checkAnswers & Page => page('Check your answers before adding a court', checkAnswers),
}
