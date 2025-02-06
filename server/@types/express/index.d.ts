import type {
  AddNewPrisonForm,
  AmendPrisonDetailsForm,
  AmendPrisonAddressForm,
  AddPrisonAddressForm,
  AddWelshPrisonAddressForm,
} from '../prisonRegisterForms'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    addNewPrisonForm: AddNewPrisonForm
    amendPrisonDetailsForm: AmendPrisonDetailsForm
    amendPrisonAddressForm: AmendPrisonAddressForm
    addPrisonAddressForm: AddPrisonAddressForm
    addWelshPrisonAddressForm: AddWelshPrisonAddressForm
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
