import { OtherAgency } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'UPDATED' | 'CREATED'

export default class OtherAgencyDetailsView {
  constructor(
    private readonly otherAgency: OtherAgency,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { otherAgency: OtherAgency; action: Action } {
    return {
      otherAgency: this.otherAgency,
      action: this.action,
    }
  }
}
