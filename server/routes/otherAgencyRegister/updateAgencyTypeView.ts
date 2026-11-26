import { otherAgencyTypes } from './otherAgencyData'

type Navigation = {
  cancelButton: string
}

export default class UpdateAgencyTypeView {
  constructor(
    private readonly name: string,
    private readonly navigation: Navigation,
    private readonly errors?: Array<Record<string, string>>,
    private readonly agencyType?: string,
  ) {}

  get renderArgs() {
    return {
      name: this.name,
      navigation: this.navigation,
      errors: this.errors || [],
      agencyTypeOptions: otherAgencyTypes.map(type => ({
        value: type.value,
        text: type.description,
        checked: type.value === this.agencyType,
      })),
    }
  }
}
