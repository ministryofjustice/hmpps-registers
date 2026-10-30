import { PoliceCustodySuite } from '../../@types/prisonRegister'
import config from '../../config'

export type Action = 'NONE' | 'UPDATED'

export default class PoliceCustodySuiteDetailsView {
  constructor(
    private readonly policeCustodySuite: PoliceCustodySuite,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { policeCustodySuite: PoliceCustodySuite; action: Action; agencyRegistersDeleteEnabled: boolean } {
    return {
      policeCustodySuite: this.policeCustodySuite,
      action: this.action,
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
    }
  }
}
