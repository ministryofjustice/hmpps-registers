import { Prison } from '../../@types/prisonRegister'

export type PrisonDetail = {
  id: string
  name: string
  active: boolean
}

export type PrisonPageView = {
  prisons: PrisonDetail[]
}

export default function prisonMapper(prison: Prison): PrisonDetail {
  return {
    id: prison.prisonId,
    name: prison.prisonName,
    active: prison.active,
  }
}

export function prisonPageMapper(prisonResults: Prison[]): PrisonPageView {
  const prisons = prisonResults.map((prison: Prison) => prisonMapper(prison))
  return { prisons }
}
