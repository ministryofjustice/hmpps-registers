import AllCourtsPagedView from './allCourtsPagedView'
import data from '../testutils/mockData'
import { CourtDetail } from './courtMapper'

describe('AllCourtsPagedView', () => {
  let view: AllCourtsPagedView

  describe('with no courts', () => {
    beforeEach(() => {
      view = new AllCourtsPagedView({
        content: [],
        first: true,
        last: true,
        empty: true,
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 20,
        numberOfElements: 0,
      })
    })
    it('can handle when there are no courts', () => {
      expect(view.courtsPageView.courts).toHaveLength(0)
    })
  })
  describe('with many courts', () => {
    beforeEach(() => {
      view = new AllCourtsPagedView({
        content: [
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
        first: true,
        last: true,
        empty: false,
        totalPages: 1,
        totalElements: 3,
        number: 0,
        size: 20,
        numberOfElements: 3,
      })
    })
    it('will map each court', () => {
      expect(view.courtsPageView.courts).toHaveLength(3)
    })
    it('will map courtId', () => {
      expect(view.courtsPageView.courts.map((court: CourtDetail) => court.id)).toEqual(['SHFCC', 'SHFMC', 'AYLSMC'])
    })
    it('will convert court types', () => {
      expect(view.courtsPageView.courts.map((court: CourtDetail) => court.type)).toEqual(
        expect.arrayContaining(['Crown', 'Magistrates'])
      )
    })
    it('will map active flag', () => {
      expect(view.courtsPageView.courts.map((court: CourtDetail) => court.active)).toEqual([true, false, true])
    })
    it('will map page controls', () => {
      expect(view.courtsPageView.pageMetaData.first).toEqual(true)
      expect(view.courtsPageView.pageMetaData.last).toEqual(true)
      expect(view.courtsPageView.pageMetaData.empty).toEqual(false)
      expect(view.courtsPageView.pageMetaData.totalPages).toEqual(1)
      expect(view.courtsPageView.pageMetaData.totalElements).toEqual(3)
      expect(view.courtsPageView.pageMetaData.pageNumber).toEqual(0)
      expect(view.courtsPageView.pageMetaData.pageSize).toEqual(20)
      expect(view.courtsPageView.pageMetaData.elementsOnPage).toEqual(3)
    })
  })
})
