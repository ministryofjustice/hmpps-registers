import { AddCourtJourney } from './addCourtFlowControl'
import addCourtMapper from './addCourtMapper'

describe('addCourtMapper', () => {
  const journey: AddCourtJourney = {
    form: {
      courtId: 'AB12',
      courtName: 'Example Magistrates Court',
      description: 'An example court',
      courtType: 'MC',
      accessibleAccess: 'ACCESSIBLE',
      cjitCode: 'CJIT123',
      areaCode: 'NORTH',
      regionCode: 'YORKS',
      geographicalAreaCode: 'GEO1',
      localAuthorityCode: 'AUTH1',
      payrollRegionCode: 'PAY1',
    },
    completedSteps: [],
  }

  it('maps the form to the exact create-court API payload', () => {
    expect(addCourtMapper(journey)).toEqual({
      courtId: 'AB12',
      courtName: 'Example Magistrates Court',
      description: 'An example court',
      active: true,
      courtTypeCode: 'MC',
      accessibleAccess: 'ACCESSIBLE',
      cjitCode: 'CJIT123',
      areaCode: 'NORTH',
      regionCode: 'YORKS',
      geographicalAreaCode: 'GEO1',
      localAuthorityCode: 'AUTH1',
      payrollRegionCode: 'PAY1',
      addresses: [],
      phoneNumbers: [],
      emailAddresses: [],
    })
  })

  it('maps optional blank values to undefined and UNKNOWN access to omission', () => {
    expect(
      addCourtMapper({
        form: {
          courtId: 'AB12',
          courtName: 'Example Court',
          courtType: 'CC',
          accessibleAccess: 'UNKNOWN',
          description: '',
          cjitCode: '',
          areaCode: '',
          regionCode: '',
          geographicalAreaCode: '',
          localAuthorityCode: '',
          payrollRegionCode: '',
        },
        completedSteps: [],
      }),
    ).toEqual({
      courtId: 'AB12',
      courtName: 'Example Court',
      description: undefined,
      active: true,
      courtTypeCode: 'CC',
      accessibleAccess: undefined,
      cjitCode: undefined,
      areaCode: undefined,
      regionCode: undefined,
      geographicalAreaCode: undefined,
      localAuthorityCode: undefined,
      payrollRegionCode: undefined,
      addresses: [],
      phoneNumbers: [],
      emailAddresses: [],
    })
  })

  it.each([
    { courtId: '', courtName: 'Example Court', courtType: 'CC', accessibleAccess: 'NONE' },
    { courtId: 'AB12', courtName: '', courtType: 'CC', accessibleAccess: 'NONE' },
    { courtId: 'AB12', courtName: 'Example Court', courtType: '', accessibleAccess: 'NONE' },
    { courtId: 'AB12', courtName: 'Example Court', courtType: 'CC', accessibleAccess: '' },
    { courtId: 'AB12', courtName: 'Example Court', courtType: 'CC', accessibleAccess: 'INVALID' },
  ])('rejects an incomplete or invalid required form: %p', form => {
    expect(() => addCourtMapper({ form, completedSteps: [] })).toThrow(
      'Cannot create a court from an incomplete journey',
    )
  })
})
