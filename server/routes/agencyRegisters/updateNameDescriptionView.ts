type Navigation = {
  cancelButton: string
}

type NameDescription = {
  name?: string
  description?: string
}

export default class UpdateAgencyNameDescriptionView {
  constructor(
    private readonly agencyName: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly form?: NameDescription,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    form: NameDescription
  } {
    return {
      name: this.agencyName,
      navigation: this.navigation,
      errors: this.errors || [],
      form: this.form || {},
    }
  }
}
