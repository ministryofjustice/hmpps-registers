import type { AmendCourtDetailsForm } from 'forms'
import { Court, CourtType } from '../../@types/courtRegister'

interface SelectItem {
  value: string
  text: string
  selected: boolean
}

function sortAlphabetically(courtType1: SelectItem, courtType2: SelectItem) {
  if (courtType1.text < courtType2.text) {
    return -1
  }
  if (courtType1.text > courtType2.text) {
    return 1
  }
  return 0
}

export default class AmendCourtDetailsView {
  constructor(
    private readonly court: Court,
    private readonly courtTypes: Array<CourtType>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: AmendCourtDetailsForm
    courtTypes: Array<SelectItem>
    errors: Array<Record<string, string>>
  } {
    return {
      form: {
        id: this.court.courtId,
        name: this.court.courtName,
        type: this.court.type.courtType,
        description: this.court.courtDescription,
      },
      courtTypes: this.getCourtTypes(),
      errors: this.errors || [],
    }
  }

  private getCourtTypes(): Array<SelectItem> {
    return this.courtTypes
      .map((courtType: CourtType) => ({
        value: courtType.courtType,
        text: courtType.courtName,
        selected: courtType.courtType === this.court.type.courtType,
      }))
      .sort(sortAlphabetically)
  }
}
