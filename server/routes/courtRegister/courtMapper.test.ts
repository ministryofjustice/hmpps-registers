import courtsMapper, { CourtDetail, courtsPageMapper } from './courtMapper'
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
    courts = courtsPageMapper([data.court({}), data.court({})]).courts
  })

  it('will contain two courts', () => {
    expect(courts.length).toEqual(2)
  })
})
