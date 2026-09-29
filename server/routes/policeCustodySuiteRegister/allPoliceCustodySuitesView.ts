import { PoliceCustodySuite } from '../../@types/prisonRegister'
import {
  PoliceCustodySuiteFilter,
  PoliceCustodySuitePageView,
  policeCustodySuitesPageMapper,
} from './policeCustodySuiteMapper'

export default class AllPoliceCustodySuitesView {
  constructor(
    private readonly policeCustodySuites: PoliceCustodySuite[],
    private readonly filter: PoliceCustodySuiteFilter,
  ) {}

  readonly policeCustodySuitePageView = policeCustodySuitesPageMapper(this.policeCustodySuites, this.filter)

  get renderArgs(): PoliceCustodySuitePageView {
    return { ...this.policeCustodySuitePageView }
  }
}
