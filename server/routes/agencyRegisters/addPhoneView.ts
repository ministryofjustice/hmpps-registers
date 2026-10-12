type Navigation = {
  cancelButton: string
}
export default class AddAgencyPhoneView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly phoneNumber?: string,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    phoneNumber?: string
  } {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      phoneNumber: this.phoneNumber,
    }
  }
}
