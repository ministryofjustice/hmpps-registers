import courtMapper, { CourtDetail, courtsPageMapper, CourtsPageView } from './courtMapper'
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
describe('courtsPageMapper', () => {
  let courtsPage: CourtsPageView

  beforeEach(() => {
    courtsPage = courtsPageMapper({
      content: [
        data.court({
          courtId: 'SHFCC',
          courtName: 'Sheffield Crown Court',
          courtDescription: 'Sheffield Crown Court - Yorkshire',
          courtType: 'CROWN',
          active: true,
        }),
      ],
      first: true,
      last: true,
      empty: true,
      totalPages: 1,
      totalElements: 2,
      number: 3,
      size: 4,
      numberOfElements: 5,
    })
  })
  it('will map court id', () => {
    expect(courtsPage.courts[0].id).toEqual('SHFCC')
  })
  it('will map court type', () => {
    expect(courtsPage.courts[0].type).toEqual('Crown')
  })
  it('will map court active', () => {
    expect(courtsPage.courts[0].active).toEqual(true)
  })
  it('will map first page flag', () => {
    expect(courtsPage.first).toEqual(true)
  })
  it('will map last page flag', () => {
    expect(courtsPage.last).toEqual(true)
  })
  it('will map empty page flag', () => {
    expect(courtsPage.empty).toEqual(true)
  })
  it('will map total pages count', () => {
    expect(courtsPage.totalPages).toEqual(1)
  })
  it('will map total elements count', () => {
    expect(courtsPage.totalElements).toEqual(2)
  })
  it('will map page number', () => {
    expect(courtsPage.pageNumber).toEqual(3)
  })
  it('will map page size', () => {
    expect(courtsPage.pageSize).toEqual(4)
  })
  it('will map elements on page', () => {
    expect(courtsPage.elementsOnPage).toEqual(5)
  })
})
