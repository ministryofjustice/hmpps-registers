import type { UpdatePrisonDetailForm } from 'prisonForms'
import { genderTypes, prisonTypes } from './prisonData'

type Navigation = {
  cancelButton: string
}

export default class UpdatePrisonDetailView {
  constructor(
    private readonly prisonName: string,
    private readonly field: string,
    private readonly label: string,
    private readonly navigation: Navigation,
    private readonly errors: Array<Record<string, string>>,
    private readonly form: UpdatePrisonDetailForm,
  ) {}

  get renderArgs(): {
    name: string
    field: string
    label: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: UpdatePrisonDetailForm
    genderValues: { text: string; value: string }[]
    prisonTypesValues: { text: string; value: string }[]
  } {
    return {
      name: this.prisonName,
      field: this.field,
      label: this.label,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form,
      genderValues: genderTypes,
      prisonTypesValues: prisonTypes,
    }
  }
}
