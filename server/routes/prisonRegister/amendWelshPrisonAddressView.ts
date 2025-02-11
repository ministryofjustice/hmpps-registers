import type { WelshPrisonAddressForm } from 'prisonForms'

export default class AmendWelshPrisonAddressView {
  constructor(
    private readonly form: WelshPrisonAddressForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    form: WelshPrisonAddressForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
