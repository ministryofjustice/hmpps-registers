import type { AmendPrisonDetailsForm } from 'prisonForms'

const genderValues = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
]

export default class AmendPrisonDetailsView {
  constructor(private readonly form: AmendPrisonDetailsForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AmendPrisonDetailsForm
    genderValues: { text: string; value: string }[]
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      genderValues,
      errors: this.errors || [],
    }
  }
}
