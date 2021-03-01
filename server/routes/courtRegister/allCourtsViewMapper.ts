import { AllCourts } from '../../services/courtRegisterService'

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
export default class AllCourtsViewMapper {
  constructor(private readonly allCourts: AllCourts) {}

  readonly courts: {
    name: string
    type: string
    active: boolean
    id: string
  }[] = this.allCourts.courts.map(court => {
    const name = court.courtName
    const type = typeOf(court.courtType)
    const { active } = court
    const id = court.courtId
    return {
      name,
      type,
      active,
      id,
    }
  })

  get renderArgs(): Record<string, unknown> {
    return { courts: this.courts }
  }
}
