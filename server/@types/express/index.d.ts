import type {
  AddNewPrisonForm,
  AmendPrisonDetailsForm,
  AmendWelshPrisonAddressForm,
  AmendPrisonAddressForm,
  AddPrisonAddressForm,
  AddWelshPrisonAddressForm,
  DeleteWelshPrisonAddressForm,
} from '../prisonRegisterForms'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    addNewPrisonForm: AddNewPrisonForm
    amendPrisonDetailsForm: AmendPrisonDetailsForm
    amendWelshPrisonAddressForm: AmendWelshPrisonAddressForm
    amendPrisonAddressForm: AmendPrisonAddressForm
    addPrisonAddressForm: AddPrisonAddressForm
    addWelshPrisonAddressForm: AddWelshPrisonAddressForm
    deleteWelshPrisonAddressForm: DeleteWelshPrisonAddressForm
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
