import { PoliceCustodySuite, UpdatePoliceCustodySuite } from '../../@types/prisonRegister'
import { AgencyFilter } from '../utils/filter'

export type PoliceCustodySuiteFilter = AgencyFilter

export type PoliceCustodySuiteDetail = {
  id: string
  name: string
  active: boolean
}

export type PoliceCustodySuitePageView = {
  policeCustodySuites: PoliceCustodySuiteDetail[]
  filter: PoliceCustodySuiteFilter
}

export default function policeCustodySuiteMapper(policeCustodySuite: PoliceCustodySuite): PoliceCustodySuiteDetail {
  return {
    id: policeCustodySuite.policeCustodySuiteId,
    name: policeCustodySuite.policeCustodySuiteName,
    active: policeCustodySuite.active,
  }
}

export function updatePoliceCustodySuiteMapper(policeCustodySuite: PoliceCustodySuite): UpdatePoliceCustodySuite {
  return {
    policeCustodySuiteName: policeCustodySuite.policeCustodySuiteName,
    description: policeCustodySuite.description,
    active: policeCustodySuite.active,
    inactiveDate: policeCustodySuite.inactiveDate,
    cjitCode: policeCustodySuite.cjitCode,
    areaCode: policeCustodySuite.area?.code,
    regionCode: policeCustodySuite.region?.code,
    geographicalAreaCode: policeCustodySuite.geographicalArea?.code,
    localAuthorityCode: policeCustodySuite.localAuthority?.code,
    payrollRegionCode: policeCustodySuite.payrollRegion?.code,
  }
}

export function policeCustodySuitesPageMapper(
  policeCustodySuiteResults: PoliceCustodySuite[],
  filter: PoliceCustodySuiteFilter,
): PoliceCustodySuitePageView {
  const policeCustodySuites = policeCustodySuiteResults.map((policeCustodySuite: PoliceCustodySuite) =>
    policeCustodySuiteMapper(policeCustodySuite),
  )
  return { policeCustodySuites, filter }
}
