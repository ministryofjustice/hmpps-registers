import policeCustodySuiteMapper, {
  PoliceCustodySuiteDetail,
  policeCustodySuitesPageMapper,
  updatePoliceCustodySuiteMapper,
} from './policeCustodySuiteMapper'
import data from '../testutils/mockPoliceCustodySuiteData'

describe('policeCustodySuiteMapper', () => {
  let policeCustodySuite: PoliceCustodySuiteDetail

  beforeEach(() => {
    policeCustodySuite = policeCustodySuiteMapper(
      data.policeCustodySuite({
        policeCustodySuiteId: 'SHFPCS',
        policeCustodySuiteName: 'Sheffield Police Custody Suite',
        active: false,
      }),
    )
  })

  it('will map policeCustodySuiteId', () => {
    expect(policeCustodySuite.id).toEqual('SHFPCS')
  })
  it('will map policeCustodySuiteName', () => {
    expect(policeCustodySuite.name).toBe('Sheffield Police Custody Suite')
  })
  it('will map active flag', () => {
    expect(policeCustodySuite.active).toEqual(false)
  })
  it('will only map the fields shown on the list page', () => {
    expect(Object.keys(policeCustodySuite)).toEqual(['id', 'name', 'active'])
  })
})

describe('policeCustodySuitesPageMapper', () => {
  let policeCustodySuites: PoliceCustodySuiteDetail[]

  beforeEach(() => {
    policeCustodySuites = policeCustodySuitesPageMapper(
      [data.policeCustodySuite({}), data.policeCustodySuite({})],
      {},
    ).policeCustodySuites
  })

  it('will contain two police custody suites', () => {
    expect(policeCustodySuites.length).toEqual(2)
  })

  it('will pass through the filter', () => {
    expect(policeCustodySuitesPageMapper([], { active: true }).filter).toEqual({ active: true })
  })
})

describe('updatePoliceCustodySuiteMapper', () => {
  it('will map every updatable field using reference codes', () => {
    const suite = data.policeCustodySuite({
      policeCustodySuiteName: 'Sheffield Police Custody Suite',
      description: 'Desc',
      active: false,
      inactiveDate: '2024-01-01',
      cjitCode: 'C00SH00',
      area: { code: 'SY', description: 'South Yorkshire' },
      region: { code: 'YH', description: 'Yorkshire' },
      geographicalArea: { code: 'GA', description: 'Geo' },
      localAuthority: { code: 'LA', description: 'Local' },
      payrollRegion: { code: 'PR', description: 'Payroll' },
    })

    expect(updatePoliceCustodySuiteMapper(suite)).toEqual({
      policeCustodySuiteName: 'Sheffield Police Custody Suite',
      description: 'Desc',
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
