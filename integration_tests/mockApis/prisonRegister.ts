import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { Prison } from '../../server/@types/prisonRegister'
import data from '../../server/routes/testutils/mockPrisonData'

// Mock API responses

const stubPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubGetPrisonsWithFilter = (prisons: Prison[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/prisons/search.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prisons,
    },
  })

const stubGetPrison = (prison: Prison): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/prisons/id/${prison.prisonId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prison,
    },
  })

const stubGetPrisonAddress = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/prisons/id/.*/address/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data.prisonAddress({}),
    },
  })

const stubUpdatePrisonAddress = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/prison-maintenance/id/.*/address/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data.prisonAddress({}),
    },
  })

const stubUpdatePrison = (prison: Prison): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/prison-maintenance/id/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prison,
    },
  })
export default {
  stubPing,
  stubGetPrisonsWithFilter,
  stubGetPrison,
  stubUpdatePrison,
  stubGetPrisonAddress,
  stubUpdatePrisonAddress,
}

// Mock data
export const albanyPrison: Prison = data.prison({})
export const moorlandPrison: Prison = data.prison({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  active: true,
  addresses: [data.prisonAddress({})],
  types: [
    { code: 'HMP', description: 'Her Majesty’s Prison' },
    { code: 'YOI', description: 'Her Majesty’s Youth Offender Institution' },
  ],
})
export const belmarshPrison: Prison = {
  prisonId: 'BAI',
  prisonName: 'HMP Belmarsh',
  active: true,
  male: true,
  female: false,
  addresses: [
    {
      id: 16,
      addressLine1: 'Western Way',
      addressLine2: 'Thamesmead',
      town: 'London',
      county: 'Greater London',
      postcode: 'SE28 0EB',
      country: 'England',
    },
  ],
  types: [{ code: 'HMP', description: 'Her Majesty’s Prison' }],
}
