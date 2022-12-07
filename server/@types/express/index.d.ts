import type { AddNewCourtForm, AmendCourtDetailsForm, AmendCourtBuildingForm, AddCourtBuildingForm } from '../forms'
import type {
  AddNewPrisonForm,
  AmendPrisonDetailsForm,
  AmendPrisonAddressForm,
  AddPrisonAddressForm,
} from '../prisonRegisterForms'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    addNewCourtForm: AddNewCourtForm
    amendCourtDetailsForm: AmendCourtDetailsForm
    amendCourtBuildingForm: AmendCourtBuildingForm
    addCourtBuildingForm: AddCourtBuildingForm
    amendCourtBuildingContactsForm: AmendCourtBuildingContactsForm
    courtListPageLink: string
    addNewPrisonForm: AddNewPrisonForm
    amendPrisonDetailsForm: AmendPrisonDetailsForm
    amendPrisonAddressForm: AmendPrisonAddressForm
    addPrisonAddressForm: AddPrisonAddressForm
    prisonListPageLink: string
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string

      flash(type: string, message: Array<Record<string, string>>): number
      flash(message: 'errors'): Array<Record<string, string>>
      logout(done: (err: unknown) => void): void
    }
  }
}
