type Navigation = {
  cancelButton: string
}
export default class UpdateAgencyEmailView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly emailAddress?: string,
    private readonly emailId?: number,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    emailAddress?: string
    emailId?: number
  } {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      emailAddress: this.emailAddress,
      emailId: this.emailId,
    }
  }
}
