export const approvedPremisesSteps = [
  'details',
  'cjit-code',
  'accessible-access',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type ApprovedPremisesStep = (typeof approvedPremisesSteps)[number]
export type ApprovedPremisesPage = ApprovedPremisesStep | 'check-answers'

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
export type ApprovedPremisesField =
  | 'approvedPremisesId'
  | 'approvedPremisesName'
  | 'description'
  | 'contact'
  | 'cjitCode'
  | 'accessibleAccess'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddApprovedPremisesJourney {
  form: Partial<Record<ApprovedPremisesField, string>>
  completedSteps: ApprovedPremisesStep[]
}

export function isReferenceStep(step: ApprovedPremisesPage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isApprovedPremisesPage(page: string): page is ApprovedPremisesPage {
  return page === 'check-answers' || approvedPremisesSteps.some(step => step === page)
}

export function approvedPremisesPageUrl(journeyId: string, page: ApprovedPremisesPage): string {
  return `/approved-premises-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddApprovedPremisesJourney): ApprovedPremisesStep | undefined {
  return approvedPremisesSteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitApprovedPremisesPage(journey: AddApprovedPremisesJourney, page: ApprovedPremisesPage): boolean {
  const index = page === 'check-answers' ? approvedPremisesSteps.length : approvedPremisesSteps.indexOf(page)
  return approvedPremisesSteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function approvedPremisesNavigation(journeyId: string, page: ApprovedPremisesPage, changing: boolean) {
  const index = page === 'check-answers' ? approvedPremisesSteps.length : approvedPremisesSteps.indexOf(page)
  let backLink =
    index === 0 ? '/approved-premises-register' : approvedPremisesPageUrl(journeyId, approvedPremisesSteps[index - 1])
  if (changing && page !== 'check-answers') backLink = approvedPremisesPageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? approvedPremisesPageUrl(journeyId, 'check-answers')
      : approvedPremisesPageUrl(journeyId, approvedPremisesSteps[index + 1] ?? 'check-answers'),
    cancelButton: `/approved-premises-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: ApprovedPremisesStep): ApprovedPremisesField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['approvedPremisesId', 'approvedPremisesName', 'description', 'contact']
    case 'cjit-code':
      return ['cjitCode']
    case 'accessible-access':
      return ['accessibleAccess']
    default:
      throw new Error(`Unknown approved premises creation step: ${step}`)
  }
}
