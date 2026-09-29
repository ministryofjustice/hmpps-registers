import { OtherAgency } from '../../@types/prisonRegister'

export default class OtherAgencyDetailsView {
  constructor(private readonly otherAgency: OtherAgency) {}

  get renderArgs(): { otherAgency: OtherAgency } {
    return {
      otherAgency: this.otherAgency,
    }
  }
}
