import { Court, CourtsPage } from '../../@types/courtRegister'
import { PageMetaData, toPageMetaData } from '../../utils/page'

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
  pageMetaData: PageMetaData
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
  const pageMetaData = toPageMetaData(
    courtsPage.first,
    courtsPage.last,
    courtsPage.empty,
    courtsPage.totalPages,
    courtsPage.totalElements,
    courtsPage.number + 1,
    courtsPage.size,
    courtsPage.numberOfElements,
    '/court-register/paged?page=:page'
  )
  return { courts, pageMetaData }
}
