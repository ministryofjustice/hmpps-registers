import policeCustodySuiteMapper, {
  PoliceCustodySuiteDetail,
  policeCustodySuitesPageMapper,
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
