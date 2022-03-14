import type { AmendPrisonAddressForm } from 'prisonForms'

export default class AmendPrisonDetailsView {
  constructor(private readonly form: AmendPrisonAddressForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AmendPrisonAddressForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
