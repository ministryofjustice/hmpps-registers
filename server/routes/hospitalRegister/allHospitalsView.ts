import { Hospital } from '../../@types/prisonRegister'
import { HospitalFilter, HospitalPageView, hospitalsPageMapper } from './hospitalMapper'

export default class AllHospitalsView {
  constructor(
    private readonly hospitals: Hospital[],
    private readonly filter: HospitalFilter,
  ) {}

  readonly hospitalPageView = hospitalsPageMapper(this.hospitals, this.filter)

  get renderArgs(): HospitalPageView {
    return { ...this.hospitalPageView }
  }
}
