import type { AddCourtBuildingForm } from 'forms'

export default class AddNewCourtDetailsView {
  constructor(
    private readonly addCourtBuildingForm: AddCourtBuildingForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): { form: AddCourtBuildingForm; errors: Array<Record<string, string>> } {
    return {
      form: this.addCourtBuildingForm,
      errors: this.errors || [],
    }
  }
}
