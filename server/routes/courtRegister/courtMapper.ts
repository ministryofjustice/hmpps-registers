import { Court, CourtBuilding, CourtBuildingContact, CourtsPage, CourtType } from '../../@types/courtRegister'
import { PageMetaData, toPageMetaData } from '../../utils/page'

export type CourtDetail = {
  name: string
  type: string
  description: string
  active: boolean
  id: string
  buildings: CourtBuildingDetail[]
}

export type CourtBuildingDetail = {
  id: number
  code?: string
  name: string
  addressline1?: string
  addressline2?: string
  addresstown?: string
  addresscounty?: string
  addresspostcode?: string
  addresscountry?: string
  contacts: CourtBuildingContactDetail[]
}

export type CourtBuildingContactDetail = {
  id: number
  type: 'TEL' | 'FAX'
  number: string
}

export type CourtsPageView = {
  courts: CourtDetail[]
  pageMetaData: PageMetaData
  allCourtsFilter: AllCourtsFilter
  courtTypes: CourtType[]
}

export default function courtMapper(court: Court): CourtDetail {
  const name = court.courtName
  const description = court.courtDescription
  const type = court.type.courtName
  const { active } = court
  const id = court.courtId
  const buildings = court.buildings.map(courtBuildingMapper)
  return {
    name,
    description,
    type,
    active,
    id,
    buildings,
  }
}

export function courtBuildingMapper(building: CourtBuilding): CourtBuildingDetail {
  return {
    id: building.id,
    code: building.subCode,
    name: building.buildingName,
    addressline1: building.street,
    addressline2: building.locality,
    addresstown: building.town,
    addresscounty: building.county,
    addresspostcode: building.postcode,
    addresscountry: building.country,
    contacts: building.contacts.map(courtBuildingContactMapper),
  }
}

export function courtBuildingContactMapper(contact: CourtBuildingContact): CourtBuildingContactDetail {
  return {
    id: contact.id,
    type: contact.type,
    number: contact.detail,
  }
}

export function courtsPageMapper(courtsPage: CourtsPage): CourtsPageView {
  const courts = courtsPage.content.map((court: Court) => courtMapper(court))
  const pageMetaData = toPageMetaData(
    courtsPage.first,
    courtsPage.last,
    courtsPage.empty,
    courtsPage.totalPages,
    courtsPage.totalElements,
    courtsPage.number + 1,
    courtsPage.size,
    courtsPage.numberOfElements,
    '/court-register/paged?page=:page'
  )
  const allCourtsFilter: AllCourtsFilter = { courtTypeIds: [] }
  const courtTypes: CourtType[] = [
    { courtType: 'CRN', courtName: 'Crown' },
    { courtType: 'COU', courtName: 'County' },
  ]
  return { courts, pageMetaData, allCourtsFilter, courtTypes }
}

export type AllCourtsFilter = {
  courtTypeIds: string[]
  active?: boolean
}
