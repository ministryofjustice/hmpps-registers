import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubCourts = (courts: Array<Record<string, unknown>>): SuperAgentRequest =>
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
const stubCourt = (court: Record<string, unknown>): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/court-register/courts/id/${court.courtId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: court,
    },
  })

const stubUpdateCourt = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/court-register/court-maintenance/id/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        courtType: 'MAGISTRATES',
        active: false,
      },
    },
  })

export default {
  stubCourts,
  stubPing,
  stubCourt,
  stubUpdateCourt,
}
