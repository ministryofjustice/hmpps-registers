import { Court, CourtsPage } from '../../@types/courtRegister'

function typeOf(enumType: string) {
  switch (enumType) {
    case 'MAGISTRATES':
      return 'Magistrates'
    case 'CROWN':
      return 'Crown'
    case 'YOUTH':
      return 'Youth'
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

export type CourtsPageView = {
  courts: CourtDetail[]
  first: boolean
  last: boolean
  empty: boolean
  totalPages: number
  totalElements: number
  pageNumber: number
  pageSize: number
  elementsOnPage: number
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
export function courtsPageMapper(courtsPage: CourtsPage): CourtsPageView {
  const courts = courtsPage.content.map((court: Court) => courtMapper(court))
  const { first, last, empty, totalPages, totalElements } = courtsPage
  const pageNumber = courtsPage.number
  const pageSize = courtsPage.size
  const elementsOnPage = courtsPage.numberOfElements
  return {
    courts,
    first,
    last,
    empty,
    totalPages,
    totalElements,
    pageNumber,
    pageSize,
    elementsOnPage,
  }
}
