import type { AddNewPrisonForm } from 'prisonForms'
import { prisonTypes } from './prisonData'
import ControllerHelper from '../utils/controllerHelper'

export default class AddNewPrisonSummaryView {
  constructor(private readonly addPrisonForm: AddNewPrisonForm, private readonly listPageLink: string) {}

  get renderArgs(): {
    form: AddNewPrisonForm
    backLink: string
    gender: string[] | undefined
    typeDescription?: string
  } {
    const allPrisonTypes = prisonTypes

    const selectedTypes = this.addPrisonForm.prisonTypes
    const selectedPrisonTypesDesc = allPrisonTypes
      .filter(prisonTypeDto => selectedTypes?.includes(prisonTypeDto.value))
      .map(prisonTypeDto => prisonTypeDto.text)
      .join(', ')

    return {
      form: this.addPrisonForm,
      backLink: this.listPageLink,
      gender: ControllerHelper.parseStringArrayFromQuery(this.addPrisonForm.gender as string[]),
      typeDescription: selectedPrisonTypesDesc,
    }
  }
}
