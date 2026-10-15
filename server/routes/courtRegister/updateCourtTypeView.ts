type Navigation = {
  cancelButton: string
}

type CourtTypeItem = {
  value: string
  text: string
  checked: boolean
}

export default class UpdateCourtTypeView {
  constructor(
    private readonly courtName: string,
    private readonly navigation: Navigation,
    private readonly courtTypes: Array<{ code: string; description: string }>,
    private readonly errors?: Array<Record<string, string>>,
    private readonly courtType?: string,
  ) {}

  get renderArgs(): {
    name: string
    navigation: Navigation
    errors: Array<Record<string, string>>
    courtTypes: CourtTypeItem[]
  } {
    return {
      name: this.courtName,
      navigation: this.navigation,
      errors: this.errors || [],
      courtTypes: this.courtTypes.map(({ code, description }) => ({
        value: code,
        text: description,
        checked: code === this.courtType,
      })),
    }
  }
}
