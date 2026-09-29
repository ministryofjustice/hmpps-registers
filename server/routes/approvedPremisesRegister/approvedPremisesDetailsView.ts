import { ApprovedPremises } from '../../@types/prisonRegister'

export default class ApprovedPremisesDetailsView {
  constructor(private readonly approvedPremises: ApprovedPremises) {}

  get renderArgs(): { approvedPremises: ApprovedPremises } {
    return {
      approvedPremises: this.approvedPremises,
    }
  }
}
