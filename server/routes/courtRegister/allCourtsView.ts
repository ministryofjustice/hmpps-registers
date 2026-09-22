import { Court } from '../../@types/prisonRegister'
import { CourtPageView, courtsPageMapper } from './courtMapper'

export default class AllCourtsView {
  constructor(private readonly courts: Court[]) {}

  readonly courtPageView = courtsPageMapper(this.courts)

  get renderArgs(): CourtPageView {
    return { ...this.courtPageView }
  }
}
