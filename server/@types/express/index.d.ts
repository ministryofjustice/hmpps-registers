import type {
  AddAddressForm,
  UpdateAddressForm,
  AddPhoneNumberForm,
  UpdatePhoneNumberForm,
  UpdateNameDescriptionForm,
  UpdateCourtTypeForm,
  UpdateHighSecurityForm,
  UpdateAccessibleAccessForm,
  UpdateCjitCodeForm,
  UpdateContactForm,
  UpdateAgencyTypeForm,
  UpdateActiveForm,
  UpdateAreaForm,
  UpdateRegionForm,
  UpdateGeographicalAreaForm,
  UpdateLocalAuthorityForm,
  UpdatePayrollRegionForm,
  AddEmailAddressForm,
  UpdateEmailAddressForm,
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

import type { AddHospitalJourney } from '../../routes/hospitalRegister/create/addHospitalFlowControl'
import type { AddPoliceCustodySuiteJourney } from '../../routes/policeCustodySuiteRegister/create/addPoliceCustodySuiteFlowControl'
import type { AddProbationOfficeJourney } from '../../routes/probationOfficeRegister/create/addProbationOfficeFlowControl'
import type { AddOtherAgencyJourney } from '../../routes/otherAgencyRegister/create/addOtherAgencyFlowControl'
import type { AddApprovedPremisesJourney } from '../../routes/approvedPremisesRegister/create/addApprovedPremisesFlowControl'
import type { AddCourtJourney } from '../../routes/courtRegister/create/addCourtFlowControl'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    addNewPrisonForm: AddNewPrisonForm
    addCourtJourneys: Record<string, AddCourtJourney>
    addHospitalJourneys: Record<string, AddHospitalJourney>
    addApprovedPremisesJourneys: Record<string, AddApprovedPremisesJourney>
    addOtherAgencyJourneys: Record<string, AddOtherAgencyJourney>
    addProbationOfficeJourneys: Record<string, AddProbationOfficeJourney>
    addPoliceCustodySuiteJourneys: Record<string, AddPoliceCustodySuiteJourney>
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
    updateHighSecurityForm: UpdateHighSecurityForm
    updateCjitCodeForm: UpdateCjitCodeForm
    updateContactForm: UpdateContactForm
    updateAgencyTypeForm: UpdateAgencyTypeForm
    updateActiveForm: UpdateActiveForm
    updateAreaForm: UpdateAreaForm
    updateRegionForm: UpdateRegionForm
    updateGeographicalAreaForm: UpdateGeographicalAreaForm
    updateLocalAuthorityForm: UpdateLocalAuthorityForm
    updatePayrollRegionForm: UpdatePayrollRegionForm
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
