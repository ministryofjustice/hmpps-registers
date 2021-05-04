import * as querystring from 'querystring'
import { Court, CourtBuilding, CourtBuildingContact, CourtsPage, CourtType } from '../../@types/courtRegister'
import { PageMetaData, toPageMetaData } from '../../utils/page'

export type CourtDetail = {
  name: string
  type: string
  description?: string
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
  const buildings = court.buildings?.map(courtBuildingMapper) || []
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
    name: building.buildingName as string,
    addressline1: building.street,
    addressline2: building.locality,
    addresstown: building.town,
    addresscounty: building.county,
    addresspostcode: building.postcode,
    addresscountry: building.country,
    contacts: building.contacts?.map(courtBuildingContactMapper) || [],
  }
}

export function courtBuildingContactMapper(contact: CourtBuildingContact): CourtBuildingContactDetail {
  return {
    id: contact.id,
    type: contact.type,
    number: contact.detail as string,
  }
}

export function courtsPageMapper(
  courtsPage: CourtsPage,
  allCourtsFilter: AllCourtsFilter
): { courts: CourtDetail[]; pageMetaData: PageMetaData } {
  const courts = courtsPage.content?.map((court: Court) => courtMapper(court)) || []
  const pageMetaData = toPageMetaData(
    courtsPage.first as boolean,
    courtsPage.last as boolean,
    courtsPage.empty as boolean,
    courtsPage.totalPages as number,
    courtsPage.totalElements as number,
    (courtsPage.number as number) + 1,
    courtsPage.size as number,
    courtsPage.numberOfElements as number,
    `/court-register?page=:page&${querystring.stringify(allCourtsFilter)}`
  )
  return { courts, pageMetaData }
}

export function pageLinkMapper(allCourtsFilter: AllCourtsFilter, pageNumber: number): string {
  return `/court-register?page=${pageNumber}&${querystring.stringify(allCourtsFilter)}`
}

export type AllCourtsFilter = {
  courtTypeIds?: string[]
  active?: boolean
}
