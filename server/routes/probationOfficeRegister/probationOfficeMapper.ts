import { ProbationOffice } from '../../@types/prisonRegister'
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

export function probationOfficesPageMapper(
  probationOfficeResults: ProbationOffice[],
  filter: ProbationOfficeFilter,
): ProbationOfficePageView {
  const probationOffices = probationOfficeResults.map((probationOffice: ProbationOffice) =>
    probationOfficeMapper(probationOffice),
  )
  return { probationOffices, filter }
}
