import { Court } from '../../@types/prisonRegister'

export type CourtDetail = {
  id: string
  name: string
  active: boolean
  type: string
}

export type CourtPageView = {
  courts: CourtDetail[]
}

export default function courtMapper(court: Court): CourtDetail {
  return {
    id: court.courtId,
    name: court.courtName,
    active: court.active,
    type: court.courtType.description,
  }
}

export function courtsPageMapper(courtResults: Court[]): CourtPageView {
  const courts = courtResults.map((court: Court) => courtMapper(court))
  return { courts }
}
