import { AddCourtJourney } from './addCourtFlowControl'
import AddCourtView from './addCourtView'

describe('AddCourtView', () => {
  const journeyId = 'journey-123'
  const journey: AddCourtJourney = {
    form: {
      courtId: 'AB12',
      courtName: 'Example Magistrates Court',
      description: 'A local court',
      courtType: 'MC',
      accessibleAccess: 'ACCESSIBLE',
      cjitCode: 'CJIT123',
      areaCode: 'AREA1',
      areaDescription: 'Northern area',
      regionCode: 'REGION1',
      regionDescription: 'Northern region',
      geographicalAreaCode: 'GEO1',
      geographicalAreaDescription: 'Geographical north',
      localAuthorityCode: 'AUTH1',
      localAuthorityDescription: 'Example authority',
      payrollRegionCode: 'PAY1',
      payrollRegionDescription: 'Example payroll region',
    },
    completedSteps: [],
  }

  it('renders summary rows and Change links for every field', () => {
    const { rows } = new AddCourtView(journeyId, 'check-answers', journey, false, []).renderArgs

    expect(rows).toEqual([
      expect.objectContaining({
        key: { text: 'Court ID' },
        value: { text: 'AB12' },
        actions: {
          items: [
            expect.objectContaining({
              href: `/court-register/create/${journeyId}/details?change=true`,
              text: 'Change',
              visuallyHiddenText: 'court id',
              attributes: { 'data-qa': 'change-courtId-link' },
            }),
          ],
        },
      }),
      expect.objectContaining({ key: { text: 'Name' }, value: { text: 'Example Magistrates Court' } }),
      expect.objectContaining({ key: { text: 'Description' }, value: { text: 'A local court' } }),
      expect.objectContaining({ key: { text: 'Court type' }, value: { text: 'Magistrates Court' } }),
      expect.objectContaining({ key: { text: 'Accessible access' }, value: { text: 'Yes, access is accessible' } }),
      expect.objectContaining({ key: { text: 'CJIT code' }, value: { text: 'CJIT123' } }),
      expect.objectContaining({ key: { text: 'Area' }, value: { text: 'Northern area' } }),
      expect.objectContaining({ key: { text: 'Region' }, value: { text: 'Northern region' } }),
      expect.objectContaining({ key: { text: 'Geographical area' }, value: { text: 'Geographical north' } }),
      expect.objectContaining({ key: { text: 'Local authority' }, value: { text: 'Example authority' } }),
      expect.objectContaining({ key: { text: 'Payroll region' }, value: { text: 'Example payroll region' } }),
    ])
    expect(rows.map(row => row.actions.items[0].attributes['data-qa'])).toEqual([
      'change-courtId-link',
      'change-courtName-link',
      'change-description-link',
      'change-courtType-link',
      'change-accessibleAccess-link',
      'change-cjitCode-link',
      'change-area-link',
      'change-region-link',
      'change-geographicalArea-link',
      'change-localAuthority-link',
      'change-payrollRegion-link',
    ])
    expect(rows.slice(1).map(row => row.actions.items[0].href)).toEqual([
      `/court-register/create/${journeyId}/details?change=true`,
      `/court-register/create/${journeyId}/details?change=true`,
      `/court-register/create/${journeyId}/court-type?change=true`,
      `/court-register/create/${journeyId}/accessible-access?change=true`,
      `/court-register/create/${journeyId}/cjit-code?change=true`,
      `/court-register/create/${journeyId}/area?change=true`,
      `/court-register/create/${journeyId}/region?change=true`,
      `/court-register/create/${journeyId}/geographical-area?change=true`,
      `/court-register/create/${journeyId}/local-authority?change=true`,
      `/court-register/create/${journeyId}/payroll-region?change=true`,
    ])
  })

  it('marks the saved court type and accessible-access radio options as checked', () => {
    const args = new AddCourtView(journeyId, 'court-type', journey, false, []).renderArgs

    expect(args.courtTypeOptions.find(option => option.value === 'MC')?.checked).toBe(true)
    expect(args.courtTypeOptions.filter(option => option.checked)).toHaveLength(1)
    expect(args.accessibleAccessOptions.find(option => option.value === 'ACCESSIBLE')?.checked).toBe(true)
    expect(args.accessibleAccessOptions.filter(option => option.checked)).toHaveLength(1)
  })

  it('groups the check-answers fields into main details and area and region details', () => {
    const { mainDetailsRows, areaAndRegionRows, rows } = new AddCourtView(
      journeyId,
      'check-answers',
      journey,
      false,
      [],
    ).renderArgs

    expect(mainDetailsRows.map(row => row.key.text)).toEqual([
      'Court ID',
      'Name',
      'Description',
      'Court type',
      'Accessible access',
      'CJIT code',
    ])
    expect(areaAndRegionRows.map(row => row.key.text)).toEqual([
      'Area',
      'Region',
      'Geographical area',
      'Local authority',
      'Payroll region',
    ])
    expect([...mainDetailsRows, ...areaAndRegionRows]).toEqual(rows)
  })

  it('prefills the current reference step and passes through form errors and change state', () => {
    const args = new AddCourtView(journeyId, 'area', journey, true, [
      { href: '#area', text: 'Select a valid area from the suggestions' },
    ]).renderArgs

    expect(args.reference).toEqual({
      field: 'area',
      label: 'area',
      service: 'getAreas',
      script: 'autoCompleteArea',
      code: 'AREA1',
      description: 'Northern area',
      inputLabel: 'Area',
    })
    expect(args.errors).toEqual([{ href: '#area', text: 'Select a valid area from the suggestions' }])
    expect(args.changing).toBe(true)
    expect(args.form).toEqual(journey.form)
  })

  it('uses the optional-value fallback for missing summary answers', () => {
    const args = new AddCourtView(journeyId, 'check-answers', { form: {}, completedSteps: [] }, false, []).renderArgs

    expect(args.rows).toHaveLength(11)
    expect(args.rows.every(row => row.value.text === 'Not provided')).toBe(true)
  })
})
