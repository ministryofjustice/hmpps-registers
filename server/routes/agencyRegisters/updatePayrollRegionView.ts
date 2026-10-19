import type { UpdatePayrollRegionForm } from 'agencyForms'

export default class UpdateAgencyPayrollRegionView {
  constructor(
    private readonly name: string,
    private readonly navigation: { cancelButton: string },
    private readonly errors: Array<Record<string, string>>,
    private readonly form: UpdatePayrollRegionForm,
  ) {}

  get renderArgs() {
    return { name: this.name, navigation: this.navigation, errors: this.errors || [], form: this.form }
  }
}
