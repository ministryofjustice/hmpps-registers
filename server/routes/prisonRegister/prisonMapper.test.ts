import prisonMapper, { PrisonDetail, prisonPageMapper, PrisonPageView } from './prisonMapper'
import data from '../testutils/mockData'

describe('prisonMapper', () => {
  let prison: PrisonDetail

  beforeEach(() => {
    prison = prisonMapper(data.prison({}))
  })
  it('will map prisonId', () => {
    expect(prison.id).toEqual('ALI')
  })
  it('will map prisonName', () => {
    expect(prison.name).toBe('Albany (HMP)')
  })
  it('will map active flag', () => {
    expect(prison.active).toEqual(true)
  })
})

describe('prisonPageMapper', () => {
  let prisonPageView: PrisonPageView

  beforeEach(() => {
    prisonPageView = prisonPageMapper([data.prison({}), data.prison({})])
  })
  it('will contain two prisons', () => {
    expect(prisonPageView.prisons.length).toEqual(2)
  })
})
