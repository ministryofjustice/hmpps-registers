import probationOfficeMapper, {
  ProbationOfficeDetail,
  probationOfficesPageMapper,
  updateProbationOfficeMapper,
} from './probationOfficeMapper'
import data from '../testutils/mockProbationOfficeData'

describe('probationOfficeMapper', () => {
  let probationOffice: ProbationOfficeDetail

  beforeEach(() => {
    probationOffice = probationOfficeMapper(
      data.probationOffice({
        probationOfficeId: 'SHFPO',
        probationOfficeName: 'Sheffield Probation Office',
        active: false,
      }),
    )
  })

  it('will map probationOfficeId', () => {
    expect(probationOffice.id).toEqual('SHFPO')
  })
  it('will map probationOfficeName', () => {
    expect(probationOffice.name).toBe('Sheffield Probation Office')
  })
  it('will map active flag', () => {
    expect(probationOffice.active).toEqual(false)
  })
  it('will only map the fields shown on the list page', () => {
    expect(Object.keys(probationOffice)).toEqual(['id', 'name', 'active'])
  })
})

describe('probationOfficesPageMapper', () => {
  let probationOffices: ProbationOfficeDetail[]

  beforeEach(() => {
    probationOffices = probationOfficesPageMapper(
      [data.probationOffice({}), data.probationOffice({})],
      {},
    ).probationOffices
  })

  it('will contain two probation offices', () => {
    expect(probationOffices.length).toEqual(2)
  })

  it('will pass through the filter', () => {
    expect(probationOfficesPageMapper([], { active: true }).filter).toEqual({ active: true })
  })
})

describe('updateProbationOfficeMapper', () => {
  it('will map every updatable field using reference codes', () => {
    const office = data.probationOffice({
      probationOfficeName: 'Sheffield Probation Office',
      description: 'Desc',
      contact: 'Front desk',
      accessibleAccess: 'ACCESSIBLE',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      area: { code: 'SY', description: 'South Yorkshire' },
      subarea: { code: 'SA', description: 'Subarea' },
      region: { code: 'YH', description: 'Yorkshire' },
      geographicalArea: { code: 'GA', description: 'Geo' },
      localAuthority: { code: 'LA', description: 'Local' },
      payrollRegion: { code: 'PR', description: 'Payroll' },
    })

    expect(updateProbationOfficeMapper(office)).toEqual({
      probationOfficeName: 'Sheffield Probation Office',
      description: 'Desc',
      contact: 'Front desk',
      accessibleAccess: 'ACCESSIBLE',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      areaCode: 'SY',
      subareaCode: 'SA',
      regionCode: 'YH',
      geographicalAreaCode: 'GA',
      localAuthorityCode: 'LA',
      payrollRegionCode: 'PR',
    })
  })
})
