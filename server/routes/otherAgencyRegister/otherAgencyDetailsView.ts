import config from '../../config'
import { OtherAgency } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'UPDATED' | 'CREATED'

export default class OtherAgencyDetailsView {
  constructor(
    private readonly otherAgency: OtherAgency,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { otherAgency: OtherAgency; action: Action; agencyRegistersDeleteEnabled: boolean } {
    return {
      otherAgency: this.otherAgency,
      action: this.action,
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
    }
  }
}
