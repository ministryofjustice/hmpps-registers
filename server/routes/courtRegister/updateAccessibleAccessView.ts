import { accessibleAccessOptions } from './accessibleAccessData'

type Navigation = {
  cancelButton: string
}

export default class UpdateAccessibleAccessView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly accessibleAccess?: string,
  ) {}

  get renderArgs() {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      accessibleAccessOptions: accessibleAccessOptions.map(option => ({
        ...option,
        checked: option.value === this.accessibleAccess,
      })),
    }
  }
}
