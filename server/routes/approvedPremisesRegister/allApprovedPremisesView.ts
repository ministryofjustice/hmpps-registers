import { ApprovedPremises } from '../../@types/prisonRegister'
import { ApprovedPremisesFilter, ApprovedPremisesPageView, approvedPremisesPageMapper } from './approvedPremisesMapper'

export default class AllApprovedPremisesView {
  constructor(
    private readonly approvedPremisesList: ApprovedPremises[],
    private readonly filter: ApprovedPremisesFilter,
  ) {}

  readonly approvedPremisesPageView = approvedPremisesPageMapper(this.approvedPremisesList, this.filter)

  get renderArgs(): ApprovedPremisesPageView {
    return { ...this.approvedPremisesPageView }
  }
}
