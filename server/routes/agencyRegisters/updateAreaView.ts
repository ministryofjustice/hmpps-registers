import type { UpdateAreaForm } from 'agencyForms'

export default class UpdateAgencyAreaView {
  constructor(
    private readonly name: string,
    private readonly navigation: { cancelButton: string },
    private readonly errors: Array<Record<string, string>>,
    private readonly form: UpdateAreaForm,
  ) {}

  get renderArgs() {
    return { name: this.name, navigation: this.navigation, errors: this.errors || [], form: this.form }
  }
}
