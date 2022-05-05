import type { AddNewPrisonForm } from 'prisonForms'

export default class AddNewPrisonAddressView {
  constructor(
    private readonly addPrisonForm: AddNewPrisonForm,
    private readonly listPageLink: string,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: AddNewPrisonForm; backLink: string; errors: Array<Record<string, string>> } {
    return {
      form: this.addPrisonForm,
      backLink: this.listPageLink,
      errors: this.errors || [],
    }
  }
}
