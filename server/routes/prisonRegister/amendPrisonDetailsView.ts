import type { AmendPrisonDetailsForm } from 'prisonForms'

export const MALE = 'male'
export const FEMALE = 'female'

export const HMP = 'HMP'
export const YOI = 'YOI'
export const STC = 'STC'
export const IRC = 'IRC'

const genderValues = [
  { value: MALE, text: 'Male' },
  { value: FEMALE, text: 'Female' },
]

const prisonTypesValues = [
  { value: HMP, text: "Her Majesty's Prison" },
  { value: YOI, text: "Her Majesty's Youth Offender Institution" },
  { value: STC, text: 'Secure Training Centre' },
  { value: IRC, text: 'Immigration Removal Centre' },
]

export default class AmendPrisonDetailsView {
  constructor(private readonly form: AmendPrisonDetailsForm, private readonly errors?: Array<Record<string, string>>) {}

  get renderArgs(): {
    form: AmendPrisonDetailsForm
    genderValues: { text: string; value: string }[]
    prisonTypesValues: { text: string; value: string }[]
    errors: Array<Record<string, string>>
  } {
    return {
      form: this.form,
      genderValues,
      prisonTypesValues,
      errors: this.errors || [],
    }
  }
}
