import { CourtsPage } from '../../@types/courtRegister'
import type { CourtsPageView } from './courtMapper'
import { courtsPageMapper } from './courtMapper'

export default class AllCourtsPagedView {
  constructor(private readonly courtsPage: CourtsPage) {}

  readonly courtsPageView: CourtsPageView = courtsPageMapper(this.courtsPage)

  get renderArgs(): CourtsPageView {
    return this.courtsPageView
  }
}
