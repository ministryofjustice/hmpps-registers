import type { UpdateRegionForm } from 'agencyForms'

export default class UpdateAgencyRegionView {
  constructor(
    private readonly name: string,
    private readonly navigation: { cancelButton: string },
    private readonly errors: Array<Record<string, string>>,
    private readonly form: UpdateRegionForm,
  ) {}

  get renderArgs() {
    return { name: this.name, navigation: this.navigation, errors: this.errors || [], form: this.form }
  }
}
