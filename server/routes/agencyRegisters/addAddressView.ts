import type { AddAddressForm } from 'agencyForms'

type Navigation = {
  cancelButton: string
}
export default class AddAgencyAddressView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly form?: Partial<AddAddressForm>,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: Partial<AddAddressForm>
  } {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form || {},
    }
  }
}
