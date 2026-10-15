import { Court, UpdateCourt } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'

export type CourtDetail = {
  id: string
  name: string
  active: boolean
  type: string
}

export type CourtPageView = {
  courts: CourtDetail[]
  filter: CourtsFilter
}

export default function courtMapper(court: Court): CourtDetail {
  return {
    id: court.courtId,
    name: court.courtName,
    active: court.active,
    type: court.courtType.description,
  }
}

export function courtsPageMapper(courtResults: Court[], filter: CourtsFilter): CourtPageView {
  const courts = courtResults.map((court: Court) => courtMapper(court))
  return { courts, filter }
}

export function updateCourtMapper(court: Court): UpdateCourt {
  return {
    courtName: court.courtName,
    description: court.description,
    active: court.active,
    inactiveDate: court.inactiveDate,
    cjitCode: court.cjitCode,
    accessibleAccess: court.accessibleAccess as UpdateCourt['accessibleAccess'],
    areaCode: court.area?.code,
    regionCode: court.region?.code,
    geographicalAreaCode: court.geographicalArea?.code,
    localAuthorityCode: court.localAuthority?.code,
    payrollRegionCode: court.payrollRegion?.code,
    courtTypeCode: court.courtType?.code,
  }
}

export type CourtsFilter = AgencyFilter & {
  courtTypeCodes?: string[]
}
