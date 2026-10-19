import type {
  AddAddressForm,
  UpdateAddressForm,
  AddPhoneNumberForm,
  UpdatePhoneNumberForm,
  UpdateNameDescriptionForm,
  UpdateCourtTypeForm,
  UpdateAccessibleAccessForm,
  UpdateCjitCodeForm,
  UpdateActiveForm,
  UpdateAreaForm,
  UpdateRegionForm,
  UpdateGeographicalAreaForm,
} from 'agencyForms'
import type {
  AddNewPrisonForm,
  AmendPrisonDetailsForm,
  AmendWelshPrisonAddressForm,
  AmendPrisonAddressForm,
  AddPrisonAddressForm,
  AddWelshPrisonAddressForm,
  DeleteWelshPrisonAddressForm,
} from '../prisonRegisterForms'

import type { AddEmailAddressForm, UpdateEmailAddressForm } from '../agencyEditForms'

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
    allListPageLink: string
    addEmailAddressForm: AddEmailAddressForm
    addAddressForm: AddAddressForm
    updateAddressForm: UpdateAddressForm
    addPhoneNumberForm: AddPhoneNumberForm
    updatePhoneNumberForm: UpdatePhoneNumberForm
    updateEmailAddressForm: UpdateEmailAddressForm
    updateNameDescriptionForm: UpdateNameDescriptionForm
    updateCourtTypeForm: UpdateCourtTypeForm
    updateAccessibleAccessForm: UpdateAccessibleAccessForm
    updateCjitCodeForm: UpdateCjitCodeForm
    updateActiveForm: UpdateActiveForm
    updateAreaForm: UpdateAreaForm
    updateRegionForm: UpdateRegionForm
    updateGeographicalAreaForm: UpdateGeographicalAreaForm
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
