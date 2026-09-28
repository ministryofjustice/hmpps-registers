import { AgencyFilter } from '../utils/filter'

export type OtherAgencyFilter = AgencyFilter & {
  otherAgencyTypeCodes?: string[]
}
