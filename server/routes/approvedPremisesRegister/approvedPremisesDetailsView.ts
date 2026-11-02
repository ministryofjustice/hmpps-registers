import config from '../../config'
import { ApprovedPremises } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'UPDATED' | 'CREATED'

export default class ApprovedPremisesDetailsView {
  constructor(
    private readonly approvedPremises: ApprovedPremises,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { approvedPremises: ApprovedPremises; action: Action; agencyRegistersDeleteEnabled: boolean } {
    return {
      approvedPremises: this.approvedPremises,
      action: this.action,
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
    }
  }
}
