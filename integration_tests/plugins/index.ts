import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import courtRegister from '../mockApis/courtRegister'
import tokenVerification from '../mockApis/tokenVerification'

export default (on: (task: string, tasks: Record<string, unknown>) => void): void => {
  on('task', {
    reset: resetStubs,

    getLoginUrl: auth.getLoginUrl,
    stubLogin: auth.stubLogin,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubPageOfCourts: courtRegister.stubPageOfCourts,
    stubCourt: courtRegister.stubCourt,
    stubUpdateCourt: courtRegister.stubUpdateCourt,
    stubUpdateCourtBuilding: courtRegister.stubUpdateCourtBuilding,
    stubCourtTypes: courtRegister.stubCourtTypes,
    stubAddCourt: courtRegister.stubAddCourt,
    stubAddCourtBuilding: courtRegister.stubAddCourtBuilding,
    stubAddCourtBuildingContact: courtRegister.stubAddCourtBuildingContact,
    stubCourtBuilding: courtRegister.stubCourtBuilding,

    stubCourtRegisterPing: courtRegister.stubPing,
  })
}
