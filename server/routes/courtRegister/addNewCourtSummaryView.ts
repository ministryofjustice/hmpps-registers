import type { AddNewCourtForm } from 'forms'
import { CourtType } from 'courtRegister'

export default class AddNewCourtSummaryView {
  constructor(private readonly addCourtForm: AddNewCourtForm, private readonly courtTypes: Array<CourtType>) {}

  get renderArgs(): { form: AddNewCourtForm; typeDescription?: string } {
    const selectedCourtType = this.courtTypes.find(courtType => courtType.courtType === this.addCourtForm.type)
    return {
      form: this.addCourtForm,
      typeDescription: selectedCourtType && selectedCourtType.courtName,
    }
  }
}
