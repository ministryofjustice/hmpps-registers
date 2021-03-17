import courtMapper, { CourtDetail } from './courtMapper'
import data from '../testutils/mockData'

describe('courtMapper', () => {
  let court: CourtDetail

  beforeEach(() => {
    court = courtMapper(
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        courtType: 'CROWN',
        active: true,
      })
    )
  })
  it('will map courtId', () => {
    expect(court.id).toEqual('SHFCC')
  })
  it('will convert crown court type', () => {
    expect(court.type).toBe('Crown')
  })
  it('will map active flag', () => {
    expect(court.active).toEqual(true)
  })
})
