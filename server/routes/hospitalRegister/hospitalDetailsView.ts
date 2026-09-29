import { Hospital } from '../../@types/prisonRegister'

export default class HospitalDetailsView {
  constructor(private readonly hospital: Hospital) {}

  get renderArgs(): { hospital: Hospital } {
    return {
      hospital: this.hospital,
    }
  }
}
