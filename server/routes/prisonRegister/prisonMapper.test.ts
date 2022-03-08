import prisonMapper, { PrisonDetail, prisonsPageMapper } from './prisonMapper'
import data from '../testutils/mockPrisonData'

describe('prisonMapper', () => {
  let prison: PrisonDetail

  beforeEach(() => {
    prison = prisonMapper(data.prison({ addresses: [data.prisonAddress({})] }))
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
  it('will map male flag', () => {
    expect(prison.male).toEqual(true)
  })
  it('will map female flag', () => {
    expect(prison.female).toEqual(true)
  })
  it('will map address', () => {
    expect(prison.addresses[0].id).toEqual(21)
    expect(prison.addresses[0].line1).toEqual('Bawtry Road')
    expect(prison.addresses[0].line2).toEqual('Hatfield Woodhouse')
    expect(prison.addresses[0].town).toEqual('Doncaster')
    expect(prison.addresses[0].county).toEqual('South Yorkshire')
    expect(prison.addresses[0].postcode).toEqual('DN7 6BW')
    expect(prison.addresses[0].country).toEqual('England')
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
