import type { AddNewCourtForm } from 'forms'

export default class AddNewCourtDetailsView {
  constructor(
    private readonly addCourtForm: AddNewCourtForm,
    private readonly listPageLink: string,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: AddNewCourtForm; backLink: string; errors: Array<Record<string, string>> } {
    return {
      form: this.addCourtForm,
      backLink: this.listPageLink,
      errors: this.errors || [],
    }
  }
}
