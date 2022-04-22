import type { AddNewCourtForm, AmendCourtDetailsForm, AmendCourtBuildingForm, AddCourtBuildingForm } from '../forms'
import type { AmendPrisonDetailsForm, AmendPrisonAddressForm, AddPrisonAddressForm } from '../prisonRegisterForms';

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
    amendPrisonDetailsForm: AmendPrisonDetailsForm
    amendPrisonAddressForm: AmendPrisonAddressForm
    addPrisonAddressForm: AddPrisonAddressForm
  }
}

export declare global {
  namespace Express {
    interface Request {
      verified?: boolean
      user: {
        username: string
        token: string
      }
      flash(type: string, message: Array<Record<string, string>>): number
      flash(message: 'errors'): Array<Record<string, string>>
    }
  }
}
