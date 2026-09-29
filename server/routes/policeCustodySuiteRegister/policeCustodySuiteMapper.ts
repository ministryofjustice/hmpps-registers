import { PoliceCustodySuite } from '../../@types/prisonRegister'
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

export function policeCustodySuitesPageMapper(
  policeCustodySuiteResults: PoliceCustodySuite[],
  filter: PoliceCustodySuiteFilter,
): PoliceCustodySuitePageView {
  const policeCustodySuites = policeCustodySuiteResults.map((policeCustodySuite: PoliceCustodySuite) =>
    policeCustodySuiteMapper(policeCustodySuite),
  )
  return { policeCustodySuites, filter }
}
