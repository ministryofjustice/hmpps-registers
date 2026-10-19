import {
  canVisitCourtPage,
  courtNavigation,
  courtPageUrl,
  courtSteps,
  fieldsForStep,
  firstIncompleteStep,
  isCourtPage,
  isReferenceStep,
  referenceSteps,
  AddCourtJourney,
} from './addCourtFlowControl'

describe('addCourtFlowControl', () => {
  const journeyId = 'journey-123'

  it('defines the add-court steps in their required order', () => {
    expect(courtSteps).toEqual([
      'details',
      'court-type',
      'accessible-access',
      'cjit-code',
      'area',
      'region',
      'geographical-area',
      'local-authority',
      'payroll-region',
    ])
  })

  it('finds the first incomplete step and reports completion when all steps are done', () => {
    const journey: AddCourtJourney = { form: {}, completedSteps: ['details', 'court-type'] }

    expect(firstIncompleteStep(journey)).toBe('accessible-access')
    expect(firstIncompleteStep({ form: {}, completedSteps: [...courtSteps] })).toBeUndefined()
  })

  it('allows pages only after all preceding steps have been completed', () => {
    const journey: AddCourtJourney = { form: {}, completedSteps: ['details', 'court-type'] }

    expect(canVisitCourtPage(journey, 'details')).toBe(true)
    expect(canVisitCourtPage(journey, 'court-type')).toBe(true)
    expect(canVisitCourtPage(journey, 'accessible-access')).toBe(true)
    expect(canVisitCourtPage(journey, 'cjit-code')).toBe(false)
    expect(canVisitCourtPage(journey, 'check-answers')).toBe(false)
    expect(canVisitCourtPage({ form: {}, completedSteps: [...courtSteps] }, 'check-answers')).toBe(true)
  })

  it('builds navigation links for the first step, middle steps, final step, and check answers', () => {
    expect(courtNavigation(journeyId, 'details', false)).toEqual({
      backLink: '/court-register',
      nextPage: courtPageUrl(journeyId, 'court-type'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
    expect(courtNavigation(journeyId, 'area', false)).toEqual({
      backLink: courtPageUrl(journeyId, 'cjit-code'),
      nextPage: courtPageUrl(journeyId, 'region'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
    expect(courtNavigation(journeyId, 'payroll-region', false)).toEqual({
      backLink: courtPageUrl(journeyId, 'local-authority'),
      nextPage: courtPageUrl(journeyId, 'check-answers'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
    expect(courtNavigation(journeyId, 'check-answers', false)).toEqual({
      backLink: courtPageUrl(journeyId, 'payroll-region'),
      nextPage: courtPageUrl(journeyId, 'check-answers'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
  })

  it('returns to check answers after a changed step and keeps the change link as its back link', () => {
    expect(courtNavigation(journeyId, 'court-type', true)).toEqual({
      backLink: courtPageUrl(journeyId, 'check-answers'),
      nextPage: courtPageUrl(journeyId, 'check-answers'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
    expect(courtNavigation(journeyId, 'check-answers', true)).toEqual({
      backLink: courtPageUrl(journeyId, 'payroll-region'),
      nextPage: courtPageUrl(journeyId, 'check-answers'),
      cancelButton: `/court-register/create/${journeyId}/cancel`,
    })
  })

  it('selects only the fields belonging to each step', () => {
    expect(fieldsForStep('details')).toEqual(['courtId', 'courtName', 'description'])
    expect(fieldsForStep('court-type')).toEqual(['courtType'])
    expect(fieldsForStep('accessible-access')).toEqual(['accessibleAccess'])
    expect(fieldsForStep('cjit-code')).toEqual(['cjitCode'])
    expect(fieldsForStep('area')).toEqual(['areaCode', 'areaDescription'])
    expect(fieldsForStep('region')).toEqual(['regionCode', 'regionDescription'])
    expect(fieldsForStep('geographical-area')).toEqual(['geographicalAreaCode', 'geographicalAreaDescription'])
    expect(fieldsForStep('local-authority')).toEqual(['localAuthorityCode', 'localAuthorityDescription'])
    expect(fieldsForStep('payroll-region')).toEqual(['payrollRegionCode', 'payrollRegionDescription'])
  })

  it('recognises only known pages and marks only reference pages as reference steps', () => {
    expect(isCourtPage('details')).toBe(true)
    expect(isCourtPage('check-answers')).toBe(true)
    expect(isCourtPage('unknown')).toBe(false)
    expect(isReferenceStep('area')).toBe(true)
    expect(isReferenceStep('payroll-region')).toBe(true)
    expect(isReferenceStep('details')).toBe(false)
    expect(Object.keys(referenceSteps)).toEqual([
      'area',
      'region',
      'geographical-area',
      'local-authority',
      'payroll-region',
    ])
  })
})
