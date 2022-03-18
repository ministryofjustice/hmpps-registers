import type { AmendPrisonDetailsForm } from 'prisonForms'

export const MALE = 'male'
export const FEMALE = 'female'

const genderValues = [
  { value: MALE, text: 'Male' },
  { value: FEMALE, text: 'Female' },
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
