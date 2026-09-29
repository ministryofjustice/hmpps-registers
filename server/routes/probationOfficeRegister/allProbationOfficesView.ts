import { ProbationOffice } from '../../@types/prisonRegister'
import { ProbationOfficeFilter, ProbationOfficePageView, probationOfficesPageMapper } from './probationOfficeMapper'

export default class AllProbationOfficesView {
  constructor(
    private readonly probationOffices: ProbationOffice[],
    private readonly filter: ProbationOfficeFilter,
  ) {}

  readonly probationOfficePageView = probationOfficesPageMapper(this.probationOffices, this.filter)

  get renderArgs(): ProbationOfficePageView {
    return { ...this.probationOfficePageView }
  }
}
