import approvedPremisesMapper, {
  ApprovedPremisesDetail,
  approvedPremisesPageMapper,
  updateApprovedPremisesMapper,
} from './approvedPremisesMapper'
import data from '../testutils/mockApprovedPremisesData'

describe('approvedPremisesMapper', () => {
  let approvedPremises: ApprovedPremisesDetail

  beforeEach(() => {
    approvedPremises = approvedPremisesMapper(
      data.approvedPremises({
        approvedPremisesId: 'SHFAP',
        approvedPremisesName: 'Sheffield Approved Premises',
        active: false,
      }),
    )
  })

  it('will map approvedPremisesId', () => {
    expect(approvedPremises.id).toEqual('SHFAP')
  })
  it('will map approvedPremisesName', () => {
    expect(approvedPremises.name).toBe('Sheffield Approved Premises')
  })
  it('will map active flag', () => {
    expect(approvedPremises.active).toEqual(false)
  })
  it('will only map the fields shown on the list page', () => {
    expect(Object.keys(approvedPremises)).toEqual(['id', 'name', 'active'])
  })
})

describe('approvedPremisesPageMapper', () => {
  let approvedPremisesList: ApprovedPremisesDetail[]

  beforeEach(() => {
    approvedPremisesList = approvedPremisesPageMapper(
      [data.approvedPremises({}), data.approvedPremises({})],
      {},
    ).approvedPremisesList
  })

  it('will contain two approved premises', () => {
    expect(approvedPremisesList.length).toEqual(2)
  })

  it('will pass through the filter', () => {
    expect(approvedPremisesPageMapper([], { active: true }).filter).toEqual({ active: true })
  })
})

describe('updateApprovedPremisesMapper', () => {
  it('will map every updatable field using reference codes', () => {
    const office = data.approvedPremises({
      approvedPremisesName: 'Sheffield Approved Premises',
      description: 'Desc',
      contact: 'Front desk',
      accessibleAccess: 'ACCESSIBLE',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      area: { code: 'SY', description: 'South Yorkshire' },
      region: { code: 'YH', description: 'Yorkshire' },
      geographicalArea: { code: 'GA', description: 'Geo' },
      localAuthority: { code: 'LA', description: 'Local' },
      payrollRegion: { code: 'PR', description: 'Payroll' },
    })

    expect(updateApprovedPremisesMapper(office)).toEqual({
      approvedPremisesName: 'Sheffield Approved Premises',
      description: 'Desc',
      contact: 'Front desk',
      accessibleAccess: 'ACCESSIBLE',
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
