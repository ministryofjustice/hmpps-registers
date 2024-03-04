import prisonMapper, { PrisonDetail } from './prisonMapper'
import { Prison } from '../../@types/prisonRegister'

export type Action = 'NONE' | 'ACTIVATE-PRISON' | 'DEACTIVATE-PRISON' | 'UPDATED'

export default class PrisonDetailsView {
  constructor(
    private readonly prison: Prison,
    private readonly action: Action,
  ) {}

  readonly prisonDetails: PrisonDetail = prisonMapper(this.prison)

  get renderArgs(): { prisonDetails: PrisonDetail; action: Action } {
    return { prisonDetails: this.prisonDetails, action: this.action }
  }
}
