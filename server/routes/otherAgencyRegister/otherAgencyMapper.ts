import { OtherAgency, UpdateOtherAgency } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'
import { otherAgencyTypeDescription } from './otherAgencyData'

export type OtherAgencyDetail = {
  id: string
  name: string
  active: boolean
  type: string
}

export type OtherAgencyPageView = {
  otherAgencies: OtherAgencyDetail[]
  filter: OtherAgencyFilter
}

export default function otherAgencyMapper(otherAgency: OtherAgency): OtherAgencyDetail {
  return {
    id: otherAgency.agencyId,
    name: otherAgency.agencyName,
    active: otherAgency.active,
    type: otherAgencyTypeDescription(otherAgency.agencyType),
  }
}

export function updateOtherAgencyMapper(otherAgency: OtherAgency): UpdateOtherAgency {
  return {
    agencyName: otherAgency.agencyName,
    description: otherAgency.description,
    active: otherAgency.active,
    accessibleAccess: otherAgency.accessibleAccess as UpdateOtherAgency['accessibleAccess'],
    otherAgencyType: otherAgency.agencyType as UpdateOtherAgency['otherAgencyType'],
    inactiveDate: otherAgency.inactiveDate,
    cjitCode: otherAgency.cjitCode,
    areaCode: otherAgency.area?.code,
    regionCode: otherAgency.region?.code,
    geographicalAreaCode: otherAgency.geographicalArea?.code,
    localAuthorityCode: otherAgency.localAuthority?.code,
    payrollRegionCode: otherAgency.payrollRegion?.code,
  }
}

export function otherAgenciesPageMapper(
  otherAgencyResults: OtherAgency[],
  filter: OtherAgencyFilter,
): OtherAgencyPageView {
  const otherAgencies = otherAgencyResults.map((otherAgency: OtherAgency) => otherAgencyMapper(otherAgency))
  return { otherAgencies, filter }
}

export type OtherAgencyFilter = AgencyFilter & {
  otherAgencyTypeCodes?: string[]
}
