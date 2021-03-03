const { stubFor } = require('./wiremock')

const stubPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubCourts = courts =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/courts/all',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courts,
    },
  })
const stubCourt = court =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/courts/id/.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: court,
    },
  })

module.exports = {
  stubCourts,
  stubPing,
  stubCourt,
}
