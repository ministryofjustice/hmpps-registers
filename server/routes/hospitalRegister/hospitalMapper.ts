import { Hospital } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'

export type HospitalDetail = {
  id: string
  name: string
  active: boolean
  highSecurity: boolean
}

export type HospitalPageView = {
  hospitals: HospitalDetail[]
  filter: HospitalFilter
}

export default function hospitalMapper(hospital: Hospital): HospitalDetail {
  return {
    id: hospital.hospitalId,
    name: hospital.hospitalName,
    active: hospital.active,
    highSecurity: hospital.highSecurity,
  }
}

export function hospitalsPageMapper(hospitalResults: Hospital[], filter: HospitalFilter): HospitalPageView {
  const hospitals = hospitalResults.map((hospital: Hospital) => hospitalMapper(hospital))
  return { hospitals, filter }
}

export type HospitalFilter = AgencyFilter & {
  highSecurity?: boolean
}
