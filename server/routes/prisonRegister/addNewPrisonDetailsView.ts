import type { AddNewPrisonForm } from 'prisonForms'
import { genderTypes, prisonTypes } from './prisonData'

export default class AddNewPrisonDetailsView {
  constructor(
    private readonly addPrisonForm: AddNewPrisonForm,
    private readonly listPageLink: string,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: AddNewPrisonForm
    genderValues: { text: string; value: string }[]
    prisonTypesValues: { text: string; value: string }[]
    backLink: string
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.addPrisonForm,
      genderValues: genderTypes,
      prisonTypesValues: prisonTypes,
      backLink: this.listPageLink,
      errors: this.errors || [],
    }
  }
}
