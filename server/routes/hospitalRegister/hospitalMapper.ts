import { AgencyFilter } from '../utils/filter'

export type HospitalFilter = AgencyFilter & {
  highSecurity?: boolean
}
