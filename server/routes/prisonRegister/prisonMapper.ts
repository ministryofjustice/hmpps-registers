import { Prison } from '../../@types/prisonRegister'

export type PrisonDetail = {
  id: string
  name: string
  active: boolean
}

export type PrisonPageView = {
  prisons: PrisonDetail[]
  allPrisonsFilter: AllPrisonsFilter
}

export default function prisonMapper(prison: Prison): PrisonDetail {
  return {
    id: prison.prisonId,
    name: prison.prisonName,
    active: prison.active,
  }
}

export function prisonsPageMapper(prisonResults: Prison[], allPrisonsFilter: AllPrisonsFilter): PrisonPageView {
  const prisons = prisonResults.map((prison: Prison) => prisonMapper(prison))
  return { prisons, allPrisonsFilter }
}

export type AllPrisonsFilter = {
  active?: boolean
  textSearch?: string
}
