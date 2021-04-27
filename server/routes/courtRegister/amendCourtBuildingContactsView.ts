import type { AmendCourtBuildingContactsForm } from 'forms'

export default class AmendCourtBuildingView {
  constructor(
    private readonly form: AmendCourtBuildingContactsForm,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: AmendCourtBuildingContactsForm
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      errors: this.errors || [],
    }
  }
}
