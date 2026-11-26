export const policeCustodySuiteSteps = [
  'details',
  'cjit-code',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type PoliceCustodySuiteStep = (typeof policeCustodySuiteSteps)[number]
export type PoliceCustodySuitePage = PoliceCustodySuiteStep | 'check-answers'

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
export type PoliceCustodySuiteField =
  | 'policeCustodySuiteId'
  | 'policeCustodySuiteName'
  | 'description'
  | 'cjitCode'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddPoliceCustodySuiteJourney {
  form: Partial<Record<PoliceCustodySuiteField, string>>
  completedSteps: PoliceCustodySuiteStep[]
}

export function isReferenceStep(step: PoliceCustodySuitePage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isPoliceCustodySuitePage(page: string): page is PoliceCustodySuitePage {
  return page === 'check-answers' || policeCustodySuiteSteps.some(step => step === page)
}

export function policeCustodySuitePageUrl(journeyId: string, page: PoliceCustodySuitePage): string {
  return `/police-custody-suite-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddPoliceCustodySuiteJourney): PoliceCustodySuiteStep | undefined {
  return policeCustodySuiteSteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitPoliceCustodySuitePage(
  journey: AddPoliceCustodySuiteJourney,
  page: PoliceCustodySuitePage,
): boolean {
  const index = page === 'check-answers' ? policeCustodySuiteSteps.length : policeCustodySuiteSteps.indexOf(page)
  return policeCustodySuiteSteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function policeCustodySuiteNavigation(journeyId: string, page: PoliceCustodySuitePage, changing: boolean) {
  const index = page === 'check-answers' ? policeCustodySuiteSteps.length : policeCustodySuiteSteps.indexOf(page)
  let backLink =
    index === 0
      ? '/police-custody-suite-register'
      : policeCustodySuitePageUrl(journeyId, policeCustodySuiteSteps[index - 1])
  if (changing && page !== 'check-answers') backLink = policeCustodySuitePageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? policeCustodySuitePageUrl(journeyId, 'check-answers')
      : policeCustodySuitePageUrl(journeyId, policeCustodySuiteSteps[index + 1] ?? 'check-answers'),
    cancelButton: `/police-custody-suite-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: PoliceCustodySuiteStep): PoliceCustodySuiteField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['policeCustodySuiteId', 'policeCustodySuiteName', 'description']
    case 'cjit-code':
      return ['cjitCode']
    default:
      throw new Error(`Unknown police custody suite creation step: ${step}`)
  }
}
