import { Court } from '../../@types/prisonRegister'
import { CourtPageView, CourtsFilter, courtsPageMapper } from './courtMapper'

export default class AllCourtsView {
  constructor(
    private readonly courts: Court[],
    private readonly filter: CourtsFilter,
  ) {}

  readonly courtPageView = courtsPageMapper(this.courts, this.filter)

  get renderArgs(): CourtPageView {
    return { ...this.courtPageView }
  }
}
