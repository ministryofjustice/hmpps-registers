import type { UpdateAddressForm } from 'agencyForms'

type Navigation = {
  cancelButton: string
}
export default class UpdateAgencyAddressView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly form: UpdateAddressForm,
    private readonly errors?: Array<Record<string, string>>,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: UpdateAddressForm
  } {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form,
    }
  }
}
