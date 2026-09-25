import { Court } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'ACTIVATE' | 'DEACTIVATE' | 'UPDATED'

export default class CourtDetailsView {
  constructor(
    private readonly court: Court,
    private readonly action: Action,
  ) {}

  get renderArgs(): { court: Court; action: Action } {
    return {
      court: this.court,
      action: this.action,
    }
  }
}
