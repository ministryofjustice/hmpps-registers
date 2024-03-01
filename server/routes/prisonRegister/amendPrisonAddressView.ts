import type { PrisonAddressForm } from 'prisonForms'

export default class AmendPrisonDetailsView {
  constructor(
    private readonly form: PrisonAddressForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: PrisonAddressForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
