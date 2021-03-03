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

export default function courtMapper(
  court: Court
): { name: string; description: string; type: string; active: boolean; id: string } {
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
