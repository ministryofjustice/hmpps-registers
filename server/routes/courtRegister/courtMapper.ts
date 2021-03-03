import { Court } from 'courtRegister'

function typeOf(enumType: string) {
  switch (enumType) {
    case 'MAGISTRATES':
      return 'Magistrates'
    case 'CROWN':
      return 'Crown'
    default:
      return enumType
  }
}

export type CourtDetail = {
  name: string
  type: string
  description: string
  active: boolean
  id: string
}

export default function courtMapper(court: Court): CourtDetail {
  const name = court.courtName
  const description = court.courtDescription
  const type = typeOf(court.courtType)
  const { active } = court
  const id = court.courtId
  return {
    name,
    description,
    type,
    active,
    id,
  }
}
