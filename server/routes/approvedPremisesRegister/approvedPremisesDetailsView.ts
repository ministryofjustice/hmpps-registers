import { ApprovedPremises } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'UPDATED'

export default class ApprovedPremisesDetailsView {
  constructor(
    private readonly approvedPremises: ApprovedPremises,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { approvedPremises: ApprovedPremises; action: Action } {
    return {
      approvedPremises: this.approvedPremises,
      action: this.action,
    }
  }
}
