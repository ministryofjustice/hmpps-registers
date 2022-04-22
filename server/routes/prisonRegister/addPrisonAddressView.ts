import type { AddPrisonAddressForm } from 'prisonForms'

export default class AddPrisonAddressView {
  constructor(private readonly form: AddPrisonAddressForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AddPrisonAddressForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
