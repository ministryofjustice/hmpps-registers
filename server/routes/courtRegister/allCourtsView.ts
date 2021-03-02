import { AllCourts } from '../../services/courtRegisterService'
import courtMapper from './courtMapper'

export default class AllCourtsView {
  constructor(private readonly allCourts: AllCourts) {}

  readonly courts: {
    name: string
    type: string
    active: boolean
    id: string
  }[] = this.allCourts.courts.map(courtMapper)

  get renderArgs(): Record<string, unknown> {
    return { courts: this.courts }
  }
}
