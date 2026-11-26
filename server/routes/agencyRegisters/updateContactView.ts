type Navigation = {
  cancelButton: string
}

export default class UpdateAgencyContactView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly contact?: string,
  ) {}

  get renderArgs() {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      contact: this.contact,
    }
  }
}
