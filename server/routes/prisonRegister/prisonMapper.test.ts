import { prisonMapper, PrisonDetail, prisonsPageMapper, PrisonSummary, prisonDetailsMapper } from './prisonMapper'
import data from '../testutils/mockPrisonData'

describe('prisonMapper', () => {
  let prison: PrisonSummary

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
  it('will map types', () => {
    expect(prison.types[0].code).toEqual('HMP')
    expect(prison.types[0].description).toEqual('His Majesty’s Prison')
  })
})

describe('prisonDetailsMapper', () => {
  let prison: PrisonDetail

  beforeEach(() => {
    prison = prisonDetailsMapper(
      data.prisonDetails({
        addresses: [data.prisonAddress({})],
        area: { code: 'AREA', description: 'Area Description' },
        region: { code: 'REG', description: 'Region Description' },
        geographicalArea: { code: 'GEO', description: 'Geographical Area Description' },
        localAuthority: { code: 'LA', description: 'Local Authority Description' },
        payrollRegion: { code: 'PR', description: 'Payroll Region Description' },
        cjitCode: 'CJIT',
      }),
    )
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
  it('will map types', () => {
    expect(prison.types[0].code).toEqual('HMP')
    expect(prison.types[0].description).toEqual('His Majesty’s Prison')
  })
  it('will map areas', () => {
    expect(prison.area.code).toEqual('AREA')
    expect(prison.area.description).toEqual('Area Description')
    expect(prison.region.code).toEqual('REG')
    expect(prison.region.description).toEqual('Region Description')
    expect(prison.geographicalArea.code).toEqual('GEO')
    expect(prison.geographicalArea.description).toEqual('Geographical Area Description')
    expect(prison.localAuthority.code).toEqual('LA')
    expect(prison.localAuthority.description).toEqual('Local Authority Description')
    expect(prison.payrollRegion.code).toEqual('PR')
    expect(prison.payrollRegion.description).toEqual('Payroll Region Description')
    expect(prison.cjitCode).toEqual('CJIT')
  })
})

describe('prisonsPageMapper', () => {
  let prisons: PrisonSummary[]

  beforeEach(() => {
    prisons = prisonsPageMapper([data.prison({}), data.prison({})], {}).prisons
  })

  it('will contain two prisons', () => {
    expect(prisons.length).toEqual(2)
  })
})
