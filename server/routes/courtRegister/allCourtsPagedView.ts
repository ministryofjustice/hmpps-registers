import { CourtsPage } from '../../@types/courtRegister'
import type { AllCourtsFilter, CourtsPageView } from './courtMapper'
import { courtsPageMapper } from './courtMapper'

export default class AllCourtsPagedView {
  constructor(private readonly courtsPage: CourtsPage, private readonly filter: AllCourtsFilter) {}

  readonly courtsPageView: CourtsPageView = courtsPageMapper(this.courtsPage, this.filter)

  get renderArgs(): CourtsPageView {
    return this.courtsPageView
  }
}
