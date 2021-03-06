import { resetStubs } from '../mockApis/wiremock'

import auth from '../mockApis/auth'
import courtRegister from '../mockApis/courtRegister'
import tokenVerification from '../mockApis/tokenVerification'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getLoginUrl: auth.getLoginUrl,
    stubLogin: auth.stubLogin,

    stubAuthUser: auth.stubUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubCourts: courtRegister.stubCourts,
    stubCourt: courtRegister.stubCourt,
    stubUpdateCourt: courtRegister.stubUpdateCourt,

    stubCourtRegisterPing: courtRegister.stubPing,
  })
}
