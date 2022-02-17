import prisonMapper, { PrisonDetail } from './prisonMapper'
import { Prison } from '../../@types/prisonRegister'

export default class PrisonDetailsView {
  constructor(private readonly prison: Prison) {}

  readonly prisonDetails: PrisonDetail = prisonMapper(this.prison)

  get renderArgs(): { prisonDetails: PrisonDetail } {
    return { prisonDetails: this.prisonDetails }
  }
}
