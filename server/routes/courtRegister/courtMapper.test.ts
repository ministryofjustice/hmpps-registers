import courtMapper, {
  CourtBuildingContactDetail,
  courtBuildingContactMapper,
  CourtBuildingDetail,
  courtBuildingMapper,
  CourtDetail,
  courtsPageMapper,
  CourtsPageView,
} from './courtMapper'
import data from '../testutils/mockData'

describe('courtMapper', () => {
  let court: CourtDetail

  beforeEach(() => {
    court = courtMapper(
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        type: { courtType: 'CROWN', courtName: 'Crown' },
        active: true,
        buildings: [data.courtBuilding({ id: 1 }), data.courtBuilding({ id: 2 })],
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
  it('will map each building', () => {
    expect(court.buildings).toHaveLength(2)
  })
})
describe('courtsPageMapper', () => {
  let courtsPageView: CourtsPageView
  const courtsPage = {
    content: [
      data.court({
        courtId: 'SHFCC',
        courtName: 'Sheffield Crown Court',
        courtDescription: 'Sheffield Crown Court - Yorkshire',
        type: { courtType: 'CROWN', courtName: 'Crown' },
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
  }
  describe('empty filter', () => {
    beforeEach(() => {
      courtsPageView = courtsPageMapper(courtsPage, { active: null, courtTypeIds: null })
    })
    it('will map court id', () => {
      expect(courtsPageView.courts[0].id).toEqual('SHFCC')
    })
    it('will map court type', () => {
      expect(courtsPageView.courts[0].type).toEqual('Crown')
    })
    it('will map court active', () => {
      expect(courtsPageView.courts[0].active).toEqual(true)
    })
    it('will map first page flag', () => {
      expect(courtsPageView.pageMetaData.first).toEqual(true)
    })
    it('will map last page flag', () => {
      expect(courtsPageView.pageMetaData.last).toEqual(true)
    })
    it('will map empty page flag', () => {
      expect(courtsPageView.pageMetaData.empty).toEqual(true)
    })
    it('will map total pages count', () => {
      expect(courtsPageView.pageMetaData.totalPages).toEqual(1)
    })
    it('will map total elements count', () => {
      expect(courtsPageView.pageMetaData.totalElements).toEqual(2)
    })
    it('will map page number to be 1 based', () => {
      expect(courtsPageView.pageMetaData.pageNumber).toEqual(4)
    })
    it('will map page size', () => {
      expect(courtsPageView.pageMetaData.pageSize).toEqual(4)
    })
    it('will map elements on page', () => {
      expect(courtsPageView.pageMetaData.elementsOnPage).toEqual(5)
    })
    it('will map hrefTemplate', () => {
      expect(courtsPageView.pageMetaData.hrefTemplate).toEqual('/court-register/paged?page=:page&active=&courtTypeIds=')
    })
  })
  describe('filter applied to hrefTemplate', () => {
    it('will include full filter in the hrefTemplate', () => {
      courtsPageView = courtsPageMapper(courtsPage, { active: true, courtTypeIds: ['CRN', 'COU'] })
      expect(courtsPageView.pageMetaData.hrefTemplate).toEqual(
        '/court-register/paged?page=:page&active=true&courtTypeIds=CRN&courtTypeIds=COU'
      )
    })
  })
})

describe('courtBuildingMapper', () => {
  let building: CourtBuildingDetail

  beforeEach(() => {
    building = courtBuildingMapper(
      data.courtBuilding({
        id: 88,
        buildingName: 'Crown Square',
        contacts: [data.courtBuildingContact({ id: 1 }), data.courtBuildingContact({ id: 2 })],
        street: '1 High Street',
        locality: 'Castle Market',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 2BJ',
        country: 'England',
        courtId: 'SHFCC',
        subCode: 'SHFCX',
      })
    )
  })
  it('will map id', () => {
    expect(building.id).toEqual(88)
  })
  it('will map building name', () => {
    expect(building.name).toEqual('Crown Square')
  })
  it('will map subCode  name', () => {
    expect(building.code).toEqual('SHFCX')
  })
  it('will map address', () => {
    expect(building.addressline1).toEqual('1 High Street')
    expect(building.addressline2).toEqual('Castle Market')
    expect(building.addresstown).toEqual('Sheffield')
    expect(building.addresscounty).toEqual('South Yorkshire')
    expect(building.addresspostcode).toEqual('S1 2BJ')
    expect(building.addresscountry).toEqual('England')
  })
  it('will map each contact', () => {
    expect(building.contacts).toHaveLength(2)
  })
})

describe('courtBuildingContactMapper', () => {
  let contact: CourtBuildingContactDetail

  beforeEach(() => {
    contact = courtBuildingContactMapper(
      data.courtBuildingContact({
        id: 1,
        courtId: 'SHFCC',
        buildingId: 88,
        type: 'TEL',
        detail: '0114 555 1234',
      })
    )
  })
  it('will map id', () => {
    expect(contact.id).toEqual(1)
  })
  it('will map type', () => {
    expect(contact.type).toEqual('TEL')
  })
  it('will map number', () => {
    expect(contact.number).toEqual('0114 555 1234')
  })
})
