import { Hospital, UpdateHospital } from '../../@types/prisonRegister'
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

export function updateHospitalMapper(hospital: Hospital): UpdateHospital {
  return {
    hospitalName: hospital.hospitalName,
    description: hospital.description,
    active: hospital.active,
    inactiveDate: hospital.inactiveDate,
    cjitCode: hospital.cjitCode,
    areaCode: hospital.area?.code,
    regionCode: hospital.region?.code,
    geographicalAreaCode: hospital.geographicalArea?.code,
    localAuthorityCode: hospital.localAuthority?.code,
    payrollRegionCode: hospital.payrollRegion?.code,
    highSecurity: hospital.highSecurity,
  }
}

export type HospitalFilter = AgencyFilter & {
  highSecurity?: boolean
}
