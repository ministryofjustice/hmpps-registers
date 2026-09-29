import { ApprovedPremises } from '../../@types/prisonRegister'
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

export function approvedPremisesPageMapper(
  approvedPremisesResults: ApprovedPremises[],
  filter: ApprovedPremisesFilter,
): ApprovedPremisesPageView {
  const approvedPremisesList = approvedPremisesResults.map((approvedPremises: ApprovedPremises) =>
    approvedPremisesMapper(approvedPremises),
  )
  return { approvedPremisesList, filter }
}
