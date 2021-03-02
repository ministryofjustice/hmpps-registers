import { Court } from 'courtRegister'
import courtMapper from './courtMapper'

export default class CourtDetailsView {
  constructor(private readonly court: Court) {}

  readonly courtDetails: {
    name: string
    type: string
    active: boolean
    id: string
  } = courtMapper(this.court)

  get renderArgs(): Record<string, unknown> {
    return { courtDetails: this.courtDetails }
  }
}
