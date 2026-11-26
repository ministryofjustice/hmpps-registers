export const probationOfficeSteps = [
  'details',
  'cjit-code',
  'accessible-access',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type ProbationOfficeStep = (typeof probationOfficeSteps)[number]
export type ProbationOfficePage = ProbationOfficeStep | 'check-answers'

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
export type ProbationOfficeField =
  | 'probationOfficeId'
  | 'probationOfficeName'
  | 'description'
  | 'contact'
  | 'cjitCode'
  | 'accessibleAccess'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddProbationOfficeJourney {
  form: Partial<Record<ProbationOfficeField, string>>
  completedSteps: ProbationOfficeStep[]
}

export function isReferenceStep(step: ProbationOfficePage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isProbationOfficePage(page: string): page is ProbationOfficePage {
  return page === 'check-answers' || probationOfficeSteps.some(step => step === page)
}

export function probationOfficePageUrl(journeyId: string, page: ProbationOfficePage): string {
  return `/probation-office-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddProbationOfficeJourney): ProbationOfficeStep | undefined {
  return probationOfficeSteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitProbationOfficePage(journey: AddProbationOfficeJourney, page: ProbationOfficePage): boolean {
  const index = page === 'check-answers' ? probationOfficeSteps.length : probationOfficeSteps.indexOf(page)
  return probationOfficeSteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function probationOfficeNavigation(journeyId: string, page: ProbationOfficePage, changing: boolean) {
  const index = page === 'check-answers' ? probationOfficeSteps.length : probationOfficeSteps.indexOf(page)
  let backLink =
    index === 0 ? '/probation-office-register' : probationOfficePageUrl(journeyId, probationOfficeSteps[index - 1])
  if (changing && page !== 'check-answers') backLink = probationOfficePageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? probationOfficePageUrl(journeyId, 'check-answers')
      : probationOfficePageUrl(journeyId, probationOfficeSteps[index + 1] ?? 'check-answers'),
    cancelButton: `/probation-office-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: ProbationOfficeStep): ProbationOfficeField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['probationOfficeId', 'probationOfficeName', 'description', 'contact']
    case 'cjit-code':
      return ['cjitCode']
    case 'accessible-access':
      return ['accessibleAccess']
    default:
      throw new Error(`Unknown probation office creation step: ${step}`)
  }
}
