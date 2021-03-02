import AllCourtsView from './allCourtsView'
import data from '../testutils/mockData'

describe('AllCourtsView', () => {
  let view

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
        ],
      })
    })
    it('will map each court', () => {
      expect(view.courts).toHaveLength(2)
    })
    it('will map courtId', () => {
      expect(view.courts[0].id).toEqual('SHFCC')
    })
    it('will convert crown court type', () => {
      expect(view.courts[0].type).toBe('Crown')
    })
    it('will convert magistrates court type', () => {
      expect(view.courts[1].type).toBe('Magistrates')
    })
    it('will map active flag', () => {
      expect(view.courts[0].active).toEqual(true)
      expect(view.courts[1].active).toEqual(false)
    })
  })
})
