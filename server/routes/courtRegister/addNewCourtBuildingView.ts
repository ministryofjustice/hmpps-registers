import type { AddNewCourtForm } from 'forms'

export default class AddNewCourtDetailsView {
  constructor(
    private readonly addCourtForm: AddNewCourtForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: AddNewCourtForm; errors: Array<Record<string, string>> } {
    return {
      form: this.addCourtForm,
      errors: this.errors || [],
    }
  }
}
