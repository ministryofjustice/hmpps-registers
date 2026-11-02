import { ProbationOffice, UpdateProbationOffice } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'

export type ProbationOfficeFilter = AgencyFilter

export type ProbationOfficeDetail = {
  id: string
  name: string
  active: boolean
}

export type ProbationOfficePageView = {
  probationOffices: ProbationOfficeDetail[]
  filter: ProbationOfficeFilter
}

export default function probationOfficeMapper(probationOffice: ProbationOffice): ProbationOfficeDetail {
  return {
    id: probationOffice.probationOfficeId,
    name: probationOffice.probationOfficeName,
    active: probationOffice.active,
  }
}

export function updateProbationOfficeMapper(probationOffice: ProbationOffice): UpdateProbationOffice {
  return {
    probationOfficeName: probationOffice.probationOfficeName,
    description: probationOffice.description,
    contact: probationOffice.contact,
    active: probationOffice.active,
    accessibleAccess: probationOffice.accessibleAccess as UpdateProbationOffice['accessibleAccess'],
    inactiveDate: probationOffice.inactiveDate,
    cjitCode: probationOffice.cjitCode,
    areaCode: probationOffice.area?.code,
    subareaCode: probationOffice.subarea?.code,
    regionCode: probationOffice.region?.code,
    geographicalAreaCode: probationOffice.geographicalArea?.code,
    localAuthorityCode: probationOffice.localAuthority?.code,
    payrollRegionCode: probationOffice.payrollRegion?.code,
  }
}

export function probationOfficesPageMapper(
  probationOfficeResults: ProbationOffice[],
  filter: ProbationOfficeFilter,
): ProbationOfficePageView {
  const probationOffices = probationOfficeResults.map((probationOffice: ProbationOffice) =>
    probationOfficeMapper(probationOffice),
  )
  return { probationOffices, filter }
}
