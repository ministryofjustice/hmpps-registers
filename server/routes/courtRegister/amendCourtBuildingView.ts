import type { AmendCourtBuildingForm } from 'forms'

export default class AmendCourtBuildingView {
  constructor(
    private readonly form: AmendCourtBuildingForm,
    private readonly listPageLink: string,
    private readonly errors?: Array<Record<string, string>>
  ) {}

  get renderArgs(): {
    form: AmendCourtBuildingForm
    backLink: string
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      backLink: this.listPageLink,
      errors: this.errors || [],
    }
  }
}
