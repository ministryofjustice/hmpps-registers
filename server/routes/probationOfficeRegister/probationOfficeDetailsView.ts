import { ProbationOffice } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'UPDATED'

export default class ProbationOfficeDetailsView {
  constructor(
    private readonly probationOffice: ProbationOffice,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { probationOffice: ProbationOffice; action: Action } {
    return {
      probationOffice: this.probationOffice,
      action: this.action,
    }
  }
}
