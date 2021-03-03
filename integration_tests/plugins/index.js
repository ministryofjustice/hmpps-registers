const { resetStubs } = require('../mockApis/wiremock')

const auth = require('../mockApis/auth')
const courtRegister = require('../mockApis/courtRegister')
const tokenVerification = require('../mockApis/tokenVerification')

module.exports = on => {
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
