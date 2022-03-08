import type { AmendPrisonDetailsForm } from 'prisonForms'

export default class AmendPrisonDetailsView {
  constructor(private readonly form: AmendPrisonDetailsForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AmendPrisonDetailsForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
