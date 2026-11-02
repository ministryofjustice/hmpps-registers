import otherAgencyMapper, {
  OtherAgencyDetail,
  otherAgenciesPageMapper,
  updateOtherAgencyMapper,
} from './otherAgencyMapper'
import data from '../testutils/mockOtherAgencyData'

describe('otherAgencyMapper', () => {
  let otherAgency: OtherAgencyDetail

  beforeEach(() => {
    otherAgency = otherAgencyMapper(
      data.otherAgency({
        agencyId: 'SHFPECS',
        agencyName: 'Sheffield PECS Agency',
        active: true,
        agencyType: 'PECS',
      }),
    )
  })

  it('will map agencyId', () => {
    expect(otherAgency.id).toEqual('SHFPECS')
  })
  it('will map agencyName', () => {
    expect(otherAgency.name).toBe('Sheffield PECS Agency')
  })
  it('will map active flag', () => {
    expect(otherAgency.active).toEqual(true)
  })
  it('will map the agency type to its description', () => {
    expect(otherAgency.type).toEqual('Prisoner Escort Custody Service')
  })
  it('will fall back to the agency type code when unknown', () => {
    expect(otherAgencyMapper(data.otherAgency({ agencyType: 'MADE_UP' })).type).toEqual('MADE_UP')
  })
})

describe('otherAgenciesPageMapper', () => {
  let otherAgencies: OtherAgencyDetail[]

  beforeEach(() => {
    otherAgencies = otherAgenciesPageMapper([data.otherAgency({}), data.otherAgency({})], {}).otherAgencies
  })

  it('will contain two other agencies', () => {
    expect(otherAgencies.length).toEqual(2)
  })

  it('will pass through the filter', () => {
    expect(otherAgenciesPageMapper([], { textSearch: 'Sheffield' }).filter).toEqual({ textSearch: 'Sheffield' })
  })
})

describe('updateOtherAgencyMapper', () => {
  it('will map every updatable field using reference codes', () => {
    const office = data.otherAgency({
      agencyName: 'Sheffield Probation Office',
      description: 'Desc',
      accessibleAccess: 'ACCESSIBLE',
      agencyType: 'PECS',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      area: { code: 'SY', description: 'South Yorkshire' },
      region: { code: 'YH', description: 'Yorkshire' },
      geographicalArea: { code: 'GA', description: 'Geo' },
      localAuthority: { code: 'LA', description: 'Local' },
      payrollRegion: { code: 'PR', description: 'Payroll' },
    })

    expect(updateOtherAgencyMapper(office)).toEqual({
      agencyName: 'Sheffield Probation Office',
      description: 'Desc',
      accessibleAccess: 'ACCESSIBLE',
      otherAgencyType: 'PECS',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      areaCode: 'SY',
      regionCode: 'YH',
      geographicalAreaCode: 'GA',
      localAuthorityCode: 'LA',
      payrollRegionCode: 'PR',
    })
  })
})
