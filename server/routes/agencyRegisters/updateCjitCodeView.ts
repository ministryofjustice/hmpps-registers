type Navigation = {
  cancelButton: string
}

export default class UpdateAgencyCjitCodeView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly cjitCode?: string,
  ) {}

  get renderArgs() {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      cjitCode: this.cjitCode,
    }
  }
}
