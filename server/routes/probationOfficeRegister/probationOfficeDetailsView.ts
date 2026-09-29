import { ProbationOffice } from '../../@types/prisonRegister'

export default class ProbationOfficeDetailsView {
  constructor(private readonly probationOffice: ProbationOffice) {}

  get renderArgs(): { probationOffice: ProbationOffice } {
    return {
      probationOffice: this.probationOffice,
    }
  }
}
