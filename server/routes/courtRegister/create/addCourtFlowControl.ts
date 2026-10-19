export const courtSteps = [
  'details',
  'court-type',
  'accessible-access',
  'cjit-code',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type CourtStep = (typeof courtSteps)[number]
export type CourtPage = CourtStep | 'check-answers'

export const referenceSteps = {
  area: { field: 'area', label: 'area', service: 'getAreas', script: 'autoCompleteArea' },
  region: { field: 'region', label: 'region', service: 'getRegions', script: 'autoCompleteRegion' },
  'geographical-area': {
    field: 'geographicalArea',
    label: 'geographical area',
    service: 'getAreas',
    script: 'autoCompleteGeographicalArea',
  },
  'local-authority': {
    field: 'localAuthority',
    label: 'local authority',
    service: 'getLocalAuthorities',
    script: 'autoCompleteLocalAuthority',
  },
  'payroll-region': {
    field: 'payrollRegion',
    label: 'payroll region',
    service: 'getPayrollRegions',
    script: 'autoCompletePayrollRegion',
  },
} as const

export type ReferenceStep = keyof typeof referenceSteps
type ReferenceField = (typeof referenceSteps)[ReferenceStep]['field']
export type CourtField =
  | 'courtId'
  | 'courtName'
  | 'description'
  | 'courtType'
  | 'accessibleAccess'
  | 'cjitCode'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddCourtJourney {
  form: Partial<Record<CourtField, string>>
  completedSteps: CourtStep[]
}

export function isReferenceStep(step: CourtPage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isCourtPage(page: string): page is CourtPage {
  return page === 'check-answers' || courtSteps.some(step => step === page)
}

export function courtPageUrl(journeyId: string, page: CourtPage): string {
  return `/court-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddCourtJourney): CourtStep | undefined {
  return courtSteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitCourtPage(journey: AddCourtJourney, page: CourtPage): boolean {
  const index = page === 'check-answers' ? courtSteps.length : courtSteps.indexOf(page)
  return courtSteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function courtNavigation(journeyId: string, page: CourtPage, changing: boolean) {
  const index = page === 'check-answers' ? courtSteps.length : courtSteps.indexOf(page)
  let backLink = index === 0 ? '/court-register' : courtPageUrl(journeyId, courtSteps[index - 1])
  if (changing && page !== 'check-answers') backLink = courtPageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? courtPageUrl(journeyId, 'check-answers')
      : courtPageUrl(journeyId, courtSteps[index + 1] ?? 'check-answers'),
    cancelButton: `/court-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: CourtStep): CourtField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['courtId', 'courtName', 'description']
    case 'court-type':
      return ['courtType']
    case 'accessible-access':
      return ['accessibleAccess']
    case 'cjit-code':
      return ['cjitCode']
    default:
      throw new Error(`Unknown court creation step: ${step}`)
  }
}
