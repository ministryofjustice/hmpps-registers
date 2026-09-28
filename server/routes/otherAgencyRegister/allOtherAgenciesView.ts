import { OtherAgency } from '../../@types/prisonRegister'
import { OtherAgencyFilter, OtherAgencyPageView, otherAgenciesPageMapper } from './otherAgencyMapper'

export default class AllOtherAgenciesView {
  constructor(
    private readonly otherAgencies: OtherAgency[],
    private readonly filter: OtherAgencyFilter,
  ) {}

  readonly otherAgencyPageView = otherAgenciesPageMapper(this.otherAgencies, this.filter)

  get renderArgs(): OtherAgencyPageView {
    return { ...this.otherAgencyPageView }
  }
}
