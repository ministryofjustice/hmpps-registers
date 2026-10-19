import type { CodeDescription } from '../../../@types/prisonRegister'
import HmppsAuthClient from '../../../data/hmppsAuthClient'
import PrisonRegisterService from '../../../services/prisonRegisterService'
import { AddCourtJourney, CourtStep, referenceSteps } from './addCourtFlowControl'
import validateCourtStep from './addCourtValidation'

jest.mock('../../../services/prisonRegisterService')

describe('validateCourtStep', () => {
  let service: jest.Mocked<PrisonRegisterService>
  const context = { username: 'test-user' }
  const validJourney = (): AddCourtJourney => ({
    form: {
      courtId: 'AB12',
      courtName: 'Example Court',
      description: 'Example description',
      courtType: 'CC',
      accessibleAccess: 'ACCESSIBLE',
      cjitCode: 'CJIT123',
    },
    completedSteps: [],
  })

  beforeEach(() => {
    jest.resetAllMocks()
    service = new PrisonRegisterService({} as HmppsAuthClient) as jest.Mocked<PrisonRegisterService>
    service.findCourt.mockResolvedValue(undefined)
    service.getAreas.mockResolvedValue([{ code: 'AREA1', description: 'Canonical area' }])
    service.getRegions.mockResolvedValue([{ code: 'REGION1', description: 'Canonical region' }])
    service.getLocalAuthorities.mockResolvedValue([{ code: 'AUTH1', description: 'Canonical authority' }])
    service.getPayrollRegions.mockResolvedValue([{ code: 'PAY1', description: 'Canonical payroll region' }])
  })

  it('accepts court IDs at both length boundaries and rejects IDs outside 2–6 alphanumeric characters', async () => {
    await Promise.all(
      ['A1', 'ABC123'].map(async courtId => {
        const journey = validJourney()
        journey.form.courtId = courtId
        await expect(validateCourtStep('details', journey, service, context)).resolves.toEqual([])
      }),
    )

    const invalidCourtIds: Array<[string, { href: string; text: string }]> = [
      ['', { href: '#courtId', text: 'Enter a court ID' }],
      ['A', { href: '#courtId', text: 'Court ID must be between 2 and 6 characters' }],
      ['ABCDEFG', { href: '#courtId', text: 'Court ID must be between 2 and 6 characters' }],
      ['AB-1', { href: '#courtId', text: 'Court ID must contain only letters and numbers' }],
    ]
    await Promise.all(
      invalidCourtIds.map(async ([courtId, error]) => {
        const journey = validJourney()
        journey.form.courtId = courtId
        await expect(validateCourtStep('details', journey, service, context)).resolves.toContainEqual(error)
      }),
    )
  })

  it('requires a court name, accepts 40 characters, and rejects longer names', async () => {
    const boundaryJourney = validJourney()
    boundaryJourney.form.courtName = 'C'.repeat(40)
    await expect(validateCourtStep('details', boundaryJourney, service, context)).resolves.toEqual([])

    const missingJourney = validJourney()
    missingJourney.form.courtName = ''
    await expect(validateCourtStep('details', missingJourney, service, context)).resolves.toContainEqual({
      href: '#courtName',
      text: 'Enter a court name',
    })

    const longJourney = validJourney()
    longJourney.form.courtName = 'C'.repeat(41)
    await expect(validateCourtStep('details', longJourney, service, context)).resolves.toContainEqual({
      href: '#courtName',
      text: 'Court name must be 40 characters or fewer',
    })
  })

  it('accepts a 3000-character description and rejects a longer description', async () => {
    const boundaryJourney = validJourney()
    boundaryJourney.form.description = 'D'.repeat(3000)
    await expect(validateCourtStep('details', boundaryJourney, service, context)).resolves.toEqual([])

    const longJourney = validJourney()
    longJourney.form.description = 'D'.repeat(3001)
    await expect(validateCourtStep('details', longJourney, service, context)).resolves.toContainEqual({
      href: '#description',
      text: 'Description must be 3000 characters or fewer',
    })
  })

  it('checks whether a syntactically valid court ID already exists', async () => {
    service.findCourt.mockResolvedValue({} as Awaited<ReturnType<PrisonRegisterService['findCourt']>>)

    await expect(validateCourtStep('details', validJourney(), service, context)).resolves.toEqual([
      { href: '#courtId', text: 'A court with this ID already exists' },
    ])
    expect(service.findCourt).toHaveBeenCalledWith(context, 'AB12')
  })

  it('requires a valid court-type radio selection', async () => {
    const emptyJourney = validJourney()
    emptyJourney.form.courtType = ''
    await expect(validateCourtStep('court-type', emptyJourney, service, context)).resolves.toEqual([
      { href: '#courtType', text: 'Select a court type' },
    ])

    const invalidJourney = validJourney()
    invalidJourney.form.courtType = 'free text'
    await expect(validateCourtStep('court-type', invalidJourney, service, context)).resolves.toEqual([
      { href: '#courtType', text: 'Select a valid court type' },
    ])
    await expect(validateCourtStep('court-type', validJourney(), service, context)).resolves.toEqual([])
  })

  it('requires a valid accessible-access radio selection', async () => {
    const emptyJourney = validJourney()
    emptyJourney.form.accessibleAccess = ''
    await expect(validateCourtStep('accessible-access', emptyJourney, service, context)).resolves.toEqual([
      { href: '#accessibleAccess', text: 'Select an accessible access option' },
    ])

    const invalidJourney = validJourney()
    invalidJourney.form.accessibleAccess = 'free text'
    await expect(validateCourtStep('accessible-access', invalidJourney, service, context)).resolves.toEqual([
      { href: '#accessibleAccess', text: 'Select a valid accessible access option' },
    ])
    await expect(validateCourtStep('accessible-access', validJourney(), service, context)).resolves.toEqual([])
  })

  it('accepts a CJIT code of seven characters and rejects longer values', async () => {
    const boundaryJourney = validJourney()
    boundaryJourney.form.cjitCode = 'C'.repeat(7)
    await expect(validateCourtStep('cjit-code', boundaryJourney, service, context)).resolves.toEqual([])

    const longJourney = validJourney()
    longJourney.form.cjitCode = 'C'.repeat(8)
    await expect(validateCourtStep('cjit-code', longJourney, service, context)).resolves.toEqual([
      { href: '#cjitCode', text: 'CJIT code must be 7 characters or fewer' },
    ])
  })

  it('allows blank optional reference selections without making a service request', async () => {
    await Promise.all(
      (Object.keys(referenceSteps) as CourtStep[]).map(async step => {
        await expect(validateCourtStep(step, validJourney(), service, context)).resolves.toEqual([])
      }),
    )
    expect(service.getAreas).not.toHaveBeenCalled()
    expect(service.getRegions).not.toHaveBeenCalled()
    expect(service.getLocalAuthorities).not.toHaveBeenCalled()
    expect(service.getPayrollRegions).not.toHaveBeenCalled()
  })

  it.each([
    ['area', 'areaCode', 'areaDescription', 'getAreas', 'AREA1', 'Canonical area'],
    ['region', 'regionCode', 'regionDescription', 'getRegions', 'REGION1', 'Canonical region'],
    ['geographical-area', 'geographicalAreaCode', 'geographicalAreaDescription', 'getAreas', 'AREA1', 'Canonical area'],
    [
      'local-authority',
      'localAuthorityCode',
      'localAuthorityDescription',
      'getLocalAuthorities',
      'AUTH1',
      'Canonical authority',
    ],
    [
      'payroll-region',
      'payrollRegionCode',
      'payrollRegionDescription',
      'getPayrollRegions',
      'PAY1',
      'Canonical payroll region',
    ],
  ] as const)(
    'uses the canonical description for the selected %s code',
    async (step, codeField, descriptionField, serviceMethod, code, description) => {
      const journey = validJourney()
      journey.form[codeField] = code
      journey.form[descriptionField] = 'Untrusted submitted description'

      await expect(validateCourtStep(step, journey, service, context)).resolves.toEqual([])

      expect(journey.form[descriptionField]).toBe(description)
      expect(service[serviceMethod]).toHaveBeenCalledWith(context)
    },
  )

  it.each([
    ['area', 'areaCode', 'areaDescription', 'getAreas', 'area'],
    ['region', 'regionCode', 'regionDescription', 'getRegions', 'region'],
    ['geographical-area', 'geographicalAreaCode', 'geographicalAreaDescription', 'getAreas', 'geographical area'],
    ['local-authority', 'localAuthorityCode', 'localAuthorityDescription', 'getLocalAuthorities', 'local authority'],
    ['payroll-region', 'payrollRegionCode', 'payrollRegionDescription', 'getPayrollRegions', 'payroll region'],
  ] as const)(
    'rejects unknown codes and free text for the %s reference',
    async (step, codeField, descriptionField, serviceMethod, label) => {
      const unknownCodeJourney = validJourney()
      unknownCodeJourney.form[codeField] = 'UNKNOWN'
      unknownCodeJourney.form[descriptionField] = 'Forged description'
      service[serviceMethod].mockResolvedValueOnce([] as CodeDescription[])

      await expect(validateCourtStep(step, unknownCodeJourney, service, context)).resolves.toEqual([
        { href: `#${referenceSteps[step].field}`, text: `Select a valid ${label} from the suggestions` },
      ])

      const freeTextJourney = validJourney()
      freeTextJourney.form[descriptionField] = 'Free text without a selected code'
      await expect(validateCourtStep(step, freeTextJourney, service, context)).resolves.toEqual([
        { href: `#${referenceSteps[step].field}`, text: `Select a valid ${label} from the suggestions` },
      ])
      expect(service[serviceMethod]).toHaveBeenCalled()
    },
  )
})
