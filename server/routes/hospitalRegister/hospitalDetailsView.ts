import { Hospital } from '../../@types/prisonRegister'
import config from '../../config'

export type Action = 'NONE' | 'UPDATED' | 'CREATED'

export default class HospitalDetailsView {
  constructor(
    private readonly hospital: Hospital,
    private readonly action: Action = 'NONE',
  ) {}

  get renderArgs(): { hospital: Hospital; action: Action; agencyRegistersDeleteEnabled: boolean } {
    return {
      hospital: this.hospital,
      action: this.action,
      agencyRegistersDeleteEnabled: config.agencyRegistersDeleteEnabled,
    }
  }
}
