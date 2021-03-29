import { components } from '../../@types/courtRegisterImport'
import courtMapper from './courtMapper'
import type { CourtDetail } from './courtMapper'

type Court = components['schemas']['CourtDto']

export type Action = 'NONE' | 'ACTIVATE' | 'DEACTIVATE'

export default class CourtDetailsView {
  constructor(private readonly court: Court, private readonly action: Action) {}

  readonly courtDetails: CourtDetail = courtMapper(this.court)

  get renderArgs(): { courtDetails: CourtDetail; action: Action } {
    return { courtDetails: this.courtDetails, action: this.action }
  }
}
