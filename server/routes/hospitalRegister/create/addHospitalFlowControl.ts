export const hospitalSteps = [
  'details',
  'high-security',
  'cjit-code',
  'area',
  'region',
  'geographical-area',
  'local-authority',
  'payroll-region',
] as const

export type HospitalStep = (typeof hospitalSteps)[number]
export type HospitalPage = HospitalStep | 'check-answers'

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
export type HospitalField =
  | 'hospitalId'
  | 'hospitalName'
  | 'description'
  | 'highSecurity'
  | 'cjitCode'
  | `${ReferenceField}Code`
  | `${ReferenceField}Description`

export interface AddHospitalJourney {
  form: Partial<Record<HospitalField, string>>
  completedSteps: HospitalStep[]
}

export function isReferenceStep(step: HospitalPage): step is ReferenceStep {
  return Object.prototype.hasOwnProperty.call(referenceSteps, step)
}

export function isHospitalPage(page: string): page is HospitalPage {
  return page === 'check-answers' || hospitalSteps.some(step => step === page)
}

export function hospitalPageUrl(journeyId: string, page: HospitalPage): string {
  return `/hospital-register/create/${journeyId}/${page}`
}

export function firstIncompleteStep(journey: AddHospitalJourney): HospitalStep | undefined {
  return hospitalSteps.find(step => !journey.completedSteps.includes(step))
}

export function canVisitHospitalPage(journey: AddHospitalJourney, page: HospitalPage): boolean {
  const index = page === 'check-answers' ? hospitalSteps.length : hospitalSteps.indexOf(page)
  return hospitalSteps.slice(0, index).every(step => journey.completedSteps.includes(step))
}

export function hospitalNavigation(journeyId: string, page: HospitalPage, changing: boolean) {
  const index = page === 'check-answers' ? hospitalSteps.length : hospitalSteps.indexOf(page)
  let backLink = index === 0 ? '/hospital-register' : hospitalPageUrl(journeyId, hospitalSteps[index - 1])
  if (changing && page !== 'check-answers') backLink = hospitalPageUrl(journeyId, 'check-answers')
  return {
    backLink,
    nextPage: changing
      ? hospitalPageUrl(journeyId, 'check-answers')
      : hospitalPageUrl(journeyId, hospitalSteps[index + 1] ?? 'check-answers'),
    cancelButton: `/hospital-register/create/${journeyId}/cancel`,
  }
}

export function fieldsForStep(step: HospitalStep): HospitalField[] {
  if (isReferenceStep(step)) {
    const { field } = referenceSteps[step]
    return [`${field}Code`, `${field}Description`]
  }
  switch (step) {
    case 'details':
      return ['hospitalId', 'hospitalName', 'description']
    case 'high-security':
      return ['highSecurity']
    case 'cjit-code':
      return ['cjitCode']
    default:
      throw new Error(`Unknown hospital creation step: ${step}`)
  }
}
