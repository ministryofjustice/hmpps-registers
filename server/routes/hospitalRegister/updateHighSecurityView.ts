import type { UpdateHighSecurityForm } from 'agencyForms'

type Navigation = {
  cancelButton: string
}

export default class UpdateHighSecurityView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly highSecurity?: string,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: UpdateHighSecurityForm
  } {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      form: { highSecurity: this.highSecurity },
    }
  }
}
