import AllCourtsView from './allCourtsView'
import data from '../testutils/mockData'
import { CourtDetail } from './courtMapper'
import { CourtType } from '../../@types/courtRegister'

const courtTypes: CourtType[] = [
  { courtType: 'COU', courtName: 'County' },
  { courtType: 'CRN', courtName: 'Crown' },
]

describe('AllCourtsView', () => {
  let view: AllCourtsView

  describe('with no courts', () => {
    beforeEach(() => {
      view = new AllCourtsView(
        {
          content: [],
          first: true,
          last: true,
          empty: true,
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: 20,
          numberOfElements: 0,
        },
        {},
        courtTypes
      )
    })
    it('can handle when there are no courts', () => {
      expect(view.courtsPageViewDetails.courts).toHaveLength(0)
    })
  })
  describe('with many courts', () => {
    beforeEach(() => {
      view = new AllCourtsView(
        {
          content: [
            data.court({
              courtId: 'SHFCC',
              courtName: 'Sheffield Crown Court',
              courtDescription: 'Sheffield Crown Court - Yorkshire',
              type: { courtType: 'CROWN', courtName: 'Crown' },
              active: true,
            }),
            data.court({
              courtId: 'SHFMC',
              courtName: 'Sheffield Magistrates Court',
              courtDescription: 'Sheffield Magistrates Court - Yorkshire',
              type: { courtType: 'MAGISTRATES', courtName: 'Magistrates' },
              active: false,
            }),
            data.court({
              courtId: 'AYLSMC',
              courtName: 'Aylesbury MC',
              type: { courtType: 'CROWN', courtName: 'Crown' },
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
        },
        {},
        courtTypes
      )
    })
    it('will map each court', () => {
      expect(view.courtsPageViewDetails.courts).toHaveLength(3)
    })
    it('will map courtId', () => {
      expect(view.courtsPageViewDetails.courts.map((court: CourtDetail) => court.id)).toEqual([
        'SHFCC',
        'SHFMC',
        'AYLSMC',
      ])
    })
    it('will convert court types', () => {
      expect(view.courtsPageViewDetails.courts.map((court: CourtDetail) => court.type)).toEqual(
        expect.arrayContaining(['Crown', 'Magistrates'])
      )
    })
    it('will map active flag', () => {
      expect(view.courtsPageViewDetails.courts.map((court: CourtDetail) => court.active)).toEqual([true, false, true])
    })
    it('will map page controls', () => {
      expect(view.courtsPageViewDetails.pageMetaData.first).toEqual(true)
      expect(view.courtsPageViewDetails.pageMetaData.last).toEqual(true)
      expect(view.courtsPageViewDetails.pageMetaData.empty).toEqual(false)
      expect(view.courtsPageViewDetails.pageMetaData.totalPages).toEqual(1)
      expect(view.courtsPageViewDetails.pageMetaData.totalElements).toEqual(3)
      expect(view.courtsPageViewDetails.pageMetaData.pageSize).toEqual(20)
      expect(view.courtsPageViewDetails.pageMetaData.elementsOnPage).toEqual(3)
    })
    it('will map page number to be 1 based', () => {
      expect(view.courtsPageViewDetails.pageMetaData.pageNumber).toEqual(1)
    })
  })
})
