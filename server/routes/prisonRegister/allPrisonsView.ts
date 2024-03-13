import { Prison } from '../../@types/prisonRegister'
import { AllPrisonsFilter, PrisonPageView, prisonsPageMapper } from './prisonMapper'

export default class AllPrisonsView {
  constructor(
    private readonly prisons: Prison[],
    private readonly allPrisonsFilter: AllPrisonsFilter,
  ) {}

  readonly prisonPageView = prisonsPageMapper(this.prisons, this.allPrisonsFilter)

  get renderArgs(): PrisonPageView {
    return { ...this.prisonPageView, allPrisonsFilter: this.allPrisonsFilter }
  }
}
