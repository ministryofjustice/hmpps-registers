import courtsMapper, { CourtDetail, courtsPageMapper, updateCourtMapper } from './courtMapper'
import data from '../testutils/mockCourtData'

describe('courtMapper', () => {
  let court: CourtDetail

  beforeEach(() => {
    court = courtsMapper(
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        active: true,
        courtType: { code: 'CC', description: 'Crown Court' },
      }),
    )
  })

  it('will map courtId', () => {
    expect(court.id).toEqual('SHFCC')
  })
  it('will map courtName', () => {
    expect(court.name).toBe('Sheffield Crown Court')
  })
  it('will map active flag', () => {
    expect(court.active).toEqual(true)
  })
  it('will map types', () => {
    expect(court.type).toEqual('Crown Court')
  })
})

describe('courtsPageMapper', () => {
  let courts: CourtDetail[]

  beforeEach(() => {
    courts = courtsPageMapper([data.court({}), data.court({})], {}).courts
  })

  it('will contain two courts', () => {
    expect(courts.length).toEqual(2)
  })
})

describe('updateCourtMapper', () => {
  it('will map all court fields to an update court request', () => {
    expect(
      updateCourtMapper(
        data.court({
          courtName: 'Sheffield Crown Court',
          description: 'Sheffield Main Crown Court',
          active: false,
          inactiveDate: '2024-01-31',
          cjitCode: 'C00SH00',
          accessibleAccess: 'ACCESSIBLE',
          courtType: { code: 'CC', description: 'Crown Court' },
          area: { code: 'A1', description: 'Area' },
          region: { code: 'R1', description: 'Region' },
          geographicalArea: { code: 'G1', description: 'Geographical area' },
          localAuthority: { code: 'L1', description: 'Local authority' },
          payrollRegion: { code: 'P1', description: 'Payroll region' },
        }),
      ),
    ).toEqual({
      courtName: 'Sheffield Crown Court',
      description: 'Sheffield Main Crown Court',
      active: false,
      inactiveDate: '2024-01-31',
      cjitCode: 'C00SH00',
      accessibleAccess: 'ACCESSIBLE',
      courtTypeCode: 'CC',
      areaCode: 'A1',
      regionCode: 'R1',
      geographicalAreaCode: 'G1',
      localAuthorityCode: 'L1',
      payrollRegionCode: 'P1',
    })
  })

  it('will leave optional reference codes undefined when the court does not have them', () => {
    const update = updateCourtMapper(
      data.court({ area: null, region: null, geographicalArea: null, localAuthority: null, payrollRegion: null }),
    )

    expect(update.areaCode).toBeUndefined()
    expect(update.regionCode).toBeUndefined()
    expect(update.geographicalAreaCode).toBeUndefined()
    expect(update.localAuthorityCode).toBeUndefined()
    expect(update.payrollRegionCode).toBeUndefined()
  })
})
