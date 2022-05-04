import type { AmendPrisonDetailsForm } from 'prisonForms'
import { genderTypes, prisonTypes } from './prisonData'

export default class AmendPrisonDetailsView {
  constructor(private readonly form: AmendPrisonDetailsForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AmendPrisonDetailsForm
    genderValues: { text: string; value: string }[]
    prisonTypesValues: { text: string; value: string }[]
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      genderValues: genderTypes,
      prisonTypesValues: prisonTypes,
      errors: this.errors || [],
    }
  }
}
