import { Court } from '../../@types/courtRegister'
import courtMapper from './courtMapper'
import type { CourtDetail } from './courtMapper'

export type Action =
  | 'NONE'
  | 'ACTIVATE-COURT'
  | 'DEACTIVATE-COURT'
  | 'ACTIVATE-BUILDING'
  | 'DEACTIVATE-BUILDING'
  | 'UPDATED'

export default class CourtDetailsView {
  constructor(private readonly court: Court, private readonly action: Action, private readonly listPageLink: string) {}

  readonly courtDetails: CourtDetail = courtMapper(this.court)

  get renderArgs(): { courtDetails: CourtDetail; action: Action; backLink: string } {
    return { courtDetails: this.courtDetails, action: this.action, backLink: this.listPageLink }
  }
}
