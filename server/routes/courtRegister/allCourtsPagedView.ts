import { CourtsPage, CourtType } from '../../@types/courtRegister'
import { AllCourtsFilter, courtsPageMapper, CourtsPageView } from './courtMapper'

export default class AllCourtsPagedView {
  constructor(
    private readonly courtsPage: CourtsPage,
    private readonly allCourtsFilter: AllCourtsFilter,
    private readonly courtTypes: Array<CourtType>
  ) {}

  readonly courtsPageViewDetails = courtsPageMapper(this.courtsPage, this.allCourtsFilter)

  get renderArgs(): CourtsPageView {
    return {
      ...this.courtsPageViewDetails,
      allCourtsFilter: this.allCourtsFilter,
      courtTypes: AllCourtsPagedView.sortCourtTypesByName(this.courtTypes),
    }
  }

  private static sortCourtTypesByName(courtTypes: CourtType[]): CourtType[] {
    return courtTypes.sort((a, b) => {
      if (a.courtName < b.courtName) return -1
      if (a.courtName > b.courtName) return 1
      return 0
    })
  }
}
