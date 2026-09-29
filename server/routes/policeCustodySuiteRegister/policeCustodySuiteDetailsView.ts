import { PoliceCustodySuite } from '../../@types/prisonRegister'

export default class PoliceCustodySuiteDetailsView {
  constructor(private readonly policeCustodySuite: PoliceCustodySuite) {}

  get renderArgs(): { policeCustodySuite: PoliceCustodySuite } {
    return {
      policeCustodySuite: this.policeCustodySuite,
    }
  }
}
