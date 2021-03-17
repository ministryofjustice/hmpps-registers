import AllCourtsView from './allCourtsView'
import data from '../testutils/mockData'

describe('AllCourtsView', () => {
  let view: AllCourtsView

  describe('with no courts', () => {
    beforeEach(() => {
      view = new AllCourtsView({ courts: [] })
    })
    it('can handle when there are no courts', () => {
      expect(view.courts).toHaveLength(0)
    })
  })
  describe('with many courts', () => {
    beforeEach(() => {
      view = new AllCourtsView({
        courts: [
          data.court({
            courtId: 'SHFCC',
            courtName: 'Sheffield Crown Court',
            courtDescription: 'Sheffield Crown Court - Yorkshire',
            courtType: 'CROWN',
            active: true,
          }),
          data.court({
            courtId: 'SHFMC',
            courtName: 'Sheffield Magistrates Court',
            courtDescription: 'Sheffield Magistrates Court - Yorkshire',
            courtType: 'MAGISTRATES',
            active: false,
          }),
          data.court({
            courtId: 'AYLSMC',
            courtName: 'Aylesbury MC',
            courtType: 'CROWN',
            active: true,
          }),
        ],
      })
    })
    it('will map each court', () => {
      expect(view.courts).toHaveLength(3)
    })
    it('will order by court name', () => {
      expect(view.courts.map(court => court.name)).toEqual([
        'Aylesbury MC',
        'Sheffield Crown Court',
        'Sheffield Magistrates Court',
      ])
    })
    it('will map courtId', () => {
      expect(view.courts[1].id).toEqual('SHFCC')
    })
    it('will convert crown court type', () => {
      expect(view.courts[1].type).toBe('Crown')
    })
    it('will convert magistrates court type', () => {
      expect(view.courts[2].type).toBe('Magistrates')
    })
    it('will map active flag', () => {
      expect(view.courts[1].active).toEqual(true)
      expect(view.courts[2].active).toEqual(false)
    })
  })
})
