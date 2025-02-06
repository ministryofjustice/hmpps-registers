import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import prisonRegister from '../mockApis/prisonRegister'
import manageUsersApi from '../mockApis/manageUsersApi'

export default (on: (task: string, tasks: Record<string, unknown>) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: auth.stubSignIn,

    stubManageUser: manageUsersApi.stubManageUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubPrisonRegisterPing: prisonRegister.stubPing,
    stubGetPrisonsWithFilter: prisonRegister.stubGetPrisonsWithFilter,
    stubGetPrison: prisonRegister.stubGetPrison,
    stubAddPrison: prisonRegister.stubAddPrison,
    stubUpdatePrison: prisonRegister.stubUpdatePrison,
    stubGetPrisonAddress: prisonRegister.stubGetPrisonAddress,
    stubUpdatePrisonAddress: prisonRegister.stubUpdatePrisonAddress,
    stubAddPrisonAddress: prisonRegister.stubAddPrisonAddress,
    stubDeletePrisonAddress: prisonRegister.stubDeletePrisonAddress,
    stubGetWelshPrisonAddress: prisonRegister.stubGetWelshPrisonAddress,
  })
}
