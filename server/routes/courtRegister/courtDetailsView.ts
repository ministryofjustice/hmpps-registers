import { Court } from '../../@types/prisonRegister'
import config from '../../config'

export type Action = 'NONE' | 'ACTIVATE' | 'DEACTIVATE' | 'UPDATED' | 'CREATED'

export default class CourtDetailsView {
  constructor(
    private readonly court: Court,
    private readonly action: Action,
  ) {}

  get renderArgs(): { court: Court; action: Action; agencyRegistersDeleteEnabled: boolean } {
    return {
      court: this.court,
      action: this.action,
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
    }
  }
}
