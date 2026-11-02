import { ApprovedPremises, UpdateApprovedPremises } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'

export type ApprovedPremisesFilter = AgencyFilter

export type ApprovedPremisesDetail = {
  id: string
  name: string
  active: boolean
}

export type ApprovedPremisesPageView = {
  approvedPremisesList: ApprovedPremisesDetail[]
  filter: ApprovedPremisesFilter
}

export default function approvedPremisesMapper(approvedPremises: ApprovedPremises): ApprovedPremisesDetail {
  return {
    id: approvedPremises.approvedPremisesId,
    name: approvedPremises.approvedPremisesName,
    active: approvedPremises.active,
  }
}

export function updateApprovedPremisesMapper(approvedPremises: ApprovedPremises): UpdateApprovedPremises {
  return {
    approvedPremisesName: approvedPremises.approvedPremisesName,
    description: approvedPremises.description,
    contact: approvedPremises.contact,
    active: approvedPremises.active,
    accessibleAccess: approvedPremises.accessibleAccess as UpdateApprovedPremises['accessibleAccess'],
    inactiveDate: approvedPremises.inactiveDate,
    cjitCode: approvedPremises.cjitCode,
    areaCode: approvedPremises.area?.code,
    regionCode: approvedPremises.region?.code,
    geographicalAreaCode: approvedPremises.geographicalArea?.code,
    localAuthorityCode: approvedPremises.localAuthority?.code,
    payrollRegionCode: approvedPremises.payrollRegion?.code,
  }
}

export function approvedPremisesPageMapper(
  approvedPremisesResults: ApprovedPremises[],
  filter: ApprovedPremisesFilter,
): ApprovedPremisesPageView {
  const approvedPremisesList = approvedPremisesResults.map((approvedPremises: ApprovedPremises) =>
    approvedPremisesMapper(approvedPremises),
  )
  return { approvedPremisesList, filter }
}
