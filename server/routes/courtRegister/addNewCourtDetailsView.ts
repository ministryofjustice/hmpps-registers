import type { AddNewCourtForm } from 'forms'
import { CourtType } from 'courtRegister'

interface SelectItem {
  value: string
  text: string
  selected: boolean
}
function anySelected(courtType: SelectItem) {
  return courtType.selected
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

export default class AddNewCourtDetailsView {
  constructor(
    private readonly addCourtForm: AddNewCourtForm,
    private readonly courtTypes: Array<CourtType>,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: AddNewCourtForm; courtTypes: Array<SelectItem>; errors: Array<Record<string, string>> } {
    return {
      form: this.addCourtForm,
      courtTypes: this.getCourtTypes(),
      errors: this.errors || [],
    }
  }

  private getCourtTypes(): Array<SelectItem> {
    const types: Array<SelectItem> = this.courtTypes
      .map((courtType: CourtType) => ({
        value: courtType.courtType,
        text: courtType.courtName,
        selected: courtType.courtType === this.addCourtForm.type,
      }))
      .sort(sortAlphabetically)
    return types.find(anySelected) ? types : [{ text: '', value: '', selected: true }, ...types]
  }
}
