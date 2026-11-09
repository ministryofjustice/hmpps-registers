import { prisonDetailsMapper, PrisonDetail, addWelshAddressMarker } from './prisonMapper'
import { PrisonDetails } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'ACTIVATE-PRISON' | 'DEACTIVATE-PRISON' | 'UPDATED'

export default class PrisonDetailsView {
  constructor(
    private readonly prison: PrisonDetails,
    private readonly action: Action,
  ) {}

  readonly prisonDetails: PrisonDetail = prisonDetailsMapper(this.prison)

  readonly isWelshPrison: boolean = this.prisonDetails.addresses[0]?.country === 'Wales'

  readonly prisonDetailsWithWelshAddressMarker = addWelshAddressMarker(this.prisonDetails)

  get renderArgs(): { prisonDetails: PrisonDetail; action: Action; isWelshPrison: boolean } {
    return {
      prisonDetails: this.prisonDetailsWithWelshAddressMarker,
      action: this.action,
      isWelshPrison: this.isWelshPrison,
    }
  }
}
