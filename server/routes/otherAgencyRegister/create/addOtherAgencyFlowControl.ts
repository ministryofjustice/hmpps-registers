export const otherAgencySteps = [
  'details',
  'agency-type',
  'cjit-code',
  'accessible-access',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type OtherAgencyStep = (typeof otherAgencySteps)[number]
export type OtherAgencyPage = OtherAgencyStep | 'check-answers'

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
export type OtherAgencyField =
  | 'agencyId'
  | 'agencyName'
  | 'description'
  | 'agencyType'
  | 'cjitCode'
  | 'accessibleAccess'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddOtherAgencyJourney {
  form: Partial<Record<OtherAgencyField, string>>
  completedSteps: OtherAgencyStep[]
}

export function isReferenceStep(step: OtherAgencyPage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isOtherAgencyPage(page: string): page is OtherAgencyPage {
  return page === 'check-answers' || otherAgencySteps.some(step => step === page)
}

export function otherAgencyPageUrl(journeyId: string, page: OtherAgencyPage): string {
  return `/other-agency-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddOtherAgencyJourney): OtherAgencyStep | undefined {
  return otherAgencySteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitOtherAgencyPage(journey: AddOtherAgencyJourney, page: OtherAgencyPage): boolean {
  const index = page === 'check-answers' ? otherAgencySteps.length : otherAgencySteps.indexOf(page)
  return otherAgencySteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function otherAgencyNavigation(journeyId: string, page: OtherAgencyPage, changing: boolean) {
  const index = page === 'check-answers' ? otherAgencySteps.length : otherAgencySteps.indexOf(page)
  let backLink = index === 0 ? '/other-agency-register' : otherAgencyPageUrl(journeyId, otherAgencySteps[index - 1])
  if (changing && page !== 'check-answers') backLink = otherAgencyPageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? otherAgencyPageUrl(journeyId, 'check-answers')
      : otherAgencyPageUrl(journeyId, otherAgencySteps[index + 1] ?? 'check-answers'),
    cancelButton: `/other-agency-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: OtherAgencyStep): OtherAgencyField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['agencyId', 'agencyName', 'description']
    case 'agency-type':
      return ['agencyType']
    case 'cjit-code':
      return ['cjitCode']
    case 'accessible-access':
      return ['accessibleAccess']
    default:
      throw new Error(`Unknown other agency creation step: ${step}`)
  }
}
