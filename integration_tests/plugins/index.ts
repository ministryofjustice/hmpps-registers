import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import hmppsAgencyRegisterApi from '../mockApis/hmppsAgencyRegisterApi'
import manageUsersApi from '../mockApis/manageUsersApi'
import componentsApi from '../mockApis/components'

export default (on: (task: string, tasks: Record<string, unknown>) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubManageUser: manageUsersApi.stubManageUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubTokenVerificationPing,

    stubManageUsersPing: manageUsersApi.stubManageUsersPing,
    stubComponentsPing: componentsApi.stubComponentsPing,

    stubHmppsAgencyRegisterApiPing: hmppsAgencyRegisterApi.stubPing,
    stubGetTownSuggestions: hmppsAgencyRegisterApi.stubGetTownSuggestions,
    stubGetAreas: hmppsAgencyRegisterApi.stubGetAreas,
    stubGetPayrollRegions: hmppsAgencyRegisterApi.stubGetPayrollRegions,
    stubGetLocalAuthorities: hmppsAgencyRegisterApi.stubGetLocalAuthorities,
    stubGetRegions: hmppsAgencyRegisterApi.stubGetRegions,
    stubGetCountySuggestions: hmppsAgencyRegisterApi.stubGetCountySuggestions,
    stubGetPrisonsWithFilter: hmppsAgencyRegisterApi.stubGetPrisonsWithFilter,
    stubGetPrison: hmppsAgencyRegisterApi.stubGetPrison,
    stubFindPrison: hmppsAgencyRegisterApi.stubFindPrison,
    stubAmendedPrison: hmppsAgencyRegisterApi.stubAmendedPrison,
    stubAddPrison: hmppsAgencyRegisterApi.stubAddPrison,
    stubUpdatePrison: hmppsAgencyRegisterApi.stubUpdatePrison,
    stubGetPrisonAddress: hmppsAgencyRegisterApi.stubGetPrisonAddress,

    stubUpdatePrisonAddress: hmppsAgencyRegisterApi.stubUpdatePrisonAddress,
    stubAddPrisonAddress: hmppsAgencyRegisterApi.stubAddPrisonAddress,
    stubDeletePrisonAddress: hmppsAgencyRegisterApi.stubDeletePrisonAddress,
    stubPutWelshPrisonAddress: hmppsAgencyRegisterApi.stubPutWelshPrisonAddress,

    stubGetCourts: hmppsAgencyRegisterApi.stubGetCourts,
    stubGetCourt: hmppsAgencyRegisterApi.stubGetCourt,
    stubDeleteCourt: hmppsAgencyRegisterApi.stubDeleteCourt,
    getDeletedCourtRequests: hmppsAgencyRegisterApi.getDeletedCourtRequests,
    stubAgencyIdUsed: hmppsAgencyRegisterApi.stubAgencyIdUsed,
    stubCourtIdAvailable: hmppsAgencyRegisterApi.stubCourtIdAvailable,
    stubCreateCourt: hmppsAgencyRegisterApi.stubCreateCourt,
    stubCreateCourtError: hmppsAgencyRegisterApi.stubCreateCourtError,
    getCreatedCourts: hmppsAgencyRegisterApi.getCreatedCourts,
    stubAddCourtAddress: hmppsAgencyRegisterApi.stubAddCourtAddress,
    getAddedCourtAddresses: hmppsAgencyRegisterApi.getAddedCourtAddresses,
    stubUpdateCourtAddress: hmppsAgencyRegisterApi.stubUpdateCourtAddress,
    getUpdatedCourtAddresses: hmppsAgencyRegisterApi.getUpdatedCourtAddresses,
    stubAddCourtPhoneNumber: hmppsAgencyRegisterApi.stubAddCourtPhoneNumber,
    getAddedCourtPhoneNumbers: hmppsAgencyRegisterApi.getAddedCourtPhoneNumbers,
    stubUpdateCourtPhoneNumber: hmppsAgencyRegisterApi.stubUpdateCourtPhoneNumber,
    getUpdatedCourtPhoneNumbers: hmppsAgencyRegisterApi.getUpdatedCourtPhoneNumbers,
    stubDeleteCourtPhoneNumber: hmppsAgencyRegisterApi.stubDeleteCourtPhoneNumber,
    getDeletedCourtPhoneNumberRequests: hmppsAgencyRegisterApi.getDeletedCourtPhoneNumberRequests,
    stubAddCourtEmailAddress: hmppsAgencyRegisterApi.stubAddCourtEmailAddress,
    stubAddCourtEmailAddressError: hmppsAgencyRegisterApi.stubAddCourtEmailAddressError,
    stubCourtMutationError: hmppsAgencyRegisterApi.stubCourtMutationError,
    getAddedCourtEmailAddresses: hmppsAgencyRegisterApi.getAddedCourtEmailAddresses,
    stubUpdateCourtEmailAddress: hmppsAgencyRegisterApi.stubUpdateCourtEmailAddress,
    stubUpdateCourt: hmppsAgencyRegisterApi.stubUpdateCourt,
    getUpdatedCourts: hmppsAgencyRegisterApi.getUpdatedCourts,
    getUpdatedCourtEmailAddresses: hmppsAgencyRegisterApi.getUpdatedCourtEmailAddresses,
    stubDeleteCourtEmailAddress: hmppsAgencyRegisterApi.stubDeleteCourtEmailAddress,
    getDeletedCourtEmailAddressRequests: hmppsAgencyRegisterApi.getDeletedCourtEmailAddressRequests,

    stubGetOtherAgencies: hmppsAgencyRegisterApi.stubGetOtherAgencies,
    stubGetOtherAgency: hmppsAgencyRegisterApi.stubGetOtherAgency,

    stubGetHospitals: hmppsAgencyRegisterApi.stubGetHospitals,
    stubGetHospital: hmppsAgencyRegisterApi.stubGetHospital,
    stubGetPoliceCustodySuites: hmppsAgencyRegisterApi.stubGetPoliceCustodySuites,
    stubGetPoliceCustodySuite: hmppsAgencyRegisterApi.stubGetPoliceCustodySuite,
    stubGetProbationOffices: hmppsAgencyRegisterApi.stubGetProbationOffices,
    stubGetProbationOffice: hmppsAgencyRegisterApi.stubGetProbationOffice,
    stubGetAllApprovedPremises: hmppsAgencyRegisterApi.stubGetAllApprovedPremises,
    stubGetApprovedPremises: hmppsAgencyRegisterApi.stubGetApprovedPremises,
  })
}
