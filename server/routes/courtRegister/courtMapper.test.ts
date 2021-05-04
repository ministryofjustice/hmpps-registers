import courtMapper, {
  CourtBuildingContactDetail,
  courtBuildingContactMapper,
  CourtBuildingDetail,
  courtBuildingMapper,
  CourtDetail,
  courtsPageMapper,
  pageLinkMapper,
} from './courtMapper'
import data from '../testutils/mockData'
import { PageMetaData } from '../../utils/page'

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
  let courtsPageViewDetails: { courts: CourtDetail[]; pageMetaData: PageMetaData }
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
      courtsPageViewDetails = courtsPageMapper(courtsPage, { active: undefined, courtTypeIds: undefined })
    })
    it('will map court id', () => {
      expect(courtsPageViewDetails.courts[0].id).toEqual('SHFCC')
    })
    it('will map court type', () => {
      expect(courtsPageViewDetails.courts[0].type).toEqual('Crown')
    })
    it('will map court active', () => {
      expect(courtsPageViewDetails.courts[0].active).toEqual(true)
    })
    it('will map first page flag', () => {
      expect(courtsPageViewDetails.pageMetaData.first).toEqual(true)
    })
    it('will map last page flag', () => {
      expect(courtsPageViewDetails.pageMetaData.last).toEqual(true)
    })
    it('will map empty page flag', () => {
      expect(courtsPageViewDetails.pageMetaData.empty).toEqual(true)
    })
    it('will map total pages count', () => {
      expect(courtsPageViewDetails.pageMetaData.totalPages).toEqual(1)
    })
    it('will map total elements count', () => {
      expect(courtsPageViewDetails.pageMetaData.totalElements).toEqual(2)
    })
    it('will map page number to be 1 based', () => {
      expect(courtsPageViewDetails.pageMetaData.pageNumber).toEqual(4)
    })
    it('will map page size', () => {
      expect(courtsPageViewDetails.pageMetaData.pageSize).toEqual(4)
    })
    it('will map elements on page', () => {
      expect(courtsPageViewDetails.pageMetaData.elementsOnPage).toEqual(5)
    })
    it('will map hrefTemplate', () => {
      expect(courtsPageViewDetails.pageMetaData.hrefTemplate).toEqual(
        '/court-register?page=:page&active=&courtTypeIds='
      )
    })
  })
  describe('filter applied to hrefTemplate', () => {
    it('will include full filter in the hrefTemplate', () => {
      courtsPageViewDetails = courtsPageMapper(courtsPage, { active: true, courtTypeIds: ['CRN', 'COU'] })
      expect(courtsPageViewDetails.pageMetaData.hrefTemplate).toEqual(
        '/court-register?page=:page&active=true&courtTypeIds=CRN&courtTypeIds=COU'
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

describe('pageLinkMapper', () => {
  it('will handle null filters', () => {
    expect(pageLinkMapper({ active: undefined, courtTypeIds: undefined }, 1)).toEqual(
      '/court-register?page=1&active=&courtTypeIds='
    )
  })
  it('will handle filter and page number', () => {
    expect(pageLinkMapper({ active: true, courtTypeIds: ['COU', 'CRN'] }, 1)).toEqual(
      '/court-register?page=1&active=true&courtTypeIds=COU&courtTypeIds=CRN'
    )
  })
})
