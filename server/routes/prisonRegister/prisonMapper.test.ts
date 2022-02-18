import prisonMapper, { PrisonDetail, prisonsPageMapper } from './prisonMapper'
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

describe('prisonsPageMapper', () => {
  let prisons: PrisonDetail[]

  beforeEach(() => {
    prisons = prisonsPageMapper([data.prison({}), data.prison({})], {}).prisons
  })

  it('will contain two prisons', () => {
    expect(prisons.length).toEqual(2)
  })
})
