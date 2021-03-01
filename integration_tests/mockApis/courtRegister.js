const { stubFor } = require('./wiremock')

// TODO add to health check
// eslint-disable-next-line no-unused-vars
const ping = () =>
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

module.exports = {
  stubCourts,
  ping,
}
