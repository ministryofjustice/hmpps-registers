import type { AddNewCourtForm } from 'forms'
import { CourtType } from '../../@types/courtRegister'

export default class AddNewCourtSummaryView {
  constructor(
    private readonly addCourtForm: AddNewCourtForm,
    private readonly courtTypes: Array<CourtType>,
    private readonly listPageLink: string
  ) {}

  get renderArgs(): { form: AddNewCourtForm; backLink: string; typeDescription?: string } {
    const selectedCourtType = this.courtTypes.find(courtType => courtType.courtType === this.addCourtForm.type)
    return {
      form: this.addCourtForm,
      backLink: this.listPageLink,
      typeDescription: selectedCourtType && selectedCourtType.courtName,
    }
  }
}
