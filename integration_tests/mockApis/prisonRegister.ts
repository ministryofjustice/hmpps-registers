import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { Prison, PrisonAddress } from '../../server/@types/prisonRegister'
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

const stubGetPrisonAddress = (prisonAddress: PrisonAddress): SuperAgentRequest =>
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
      jsonBody: prisonAddress || data.prisonAddress({}),
    },
  })
const stubPutWelshPrisonAddress = (address: { prisonId: string; addressId: string }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/prison-maintenance/id/${address.prisonId}/welsh-address/${address.addressId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data.welshPrisonAddress({}),
    },
  })

const stubAddPrison = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/prison-register/prison-maintenance`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data.prison({}),
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

const stubAddPrisonAddress = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/prison-register/prison-maintenance/id/.*/address`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: data.prisonAddress({}),
    },
  })

const stubDeletePrisonAddress = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `/prison-register/prison-maintenance/id/.*/address/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
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
  stubAddPrison,
  stubGetPrison,
  stubUpdatePrison,
  stubGetPrisonAddress,
  stubUpdatePrisonAddress,
  stubAddPrisonAddress,
  stubDeletePrisonAddress,
  stubPutWelshPrisonAddress,
}

// Mock data
export const albanyPrison: Prison = data.prison({ types: [] })
export const moorlandPrison: Prison = data.prison({
  prisonId: 'MDI',
  prisonName: 'HMP Moorland',
  active: true,
  male: false,
  female: true,
  contracted: true,
  lthse: false,
  addresses: [data.prisonAddress({})],
  types: [
    { code: 'HMP', description: 'His Majesty’s Prison' },
    { code: 'YOI', description: 'His Majesty’s Youth Offender Institution' },
  ],
  operators: [{ name: 'G4S' }],
})
export const belmarshPrison: Prison = {
  prisonId: 'BAI',
  prisonName: 'HMP Belmarsh',
  active: false,
  male: true,
  female: false,
  contracted: false,
  lthse: false,
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
  types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
  operators: [{ name: 'PSP' }],
}

export const cardiffPrison: Prison = {
  prisonId: 'CFI',
  prisonName: 'HMP Cardiff',
  active: false,
  male: true,
  female: false,
  contracted: false,
  lthse: false,
  addresses: [
    {
      id: 16,
      addressLine1: '2 Knox Road',
      addressLine2: 'Merryweather',
      town: 'Cardiff',
      county: 'Glamorgan',
      postcode: 'CF24 0UG',
      country: 'Wales',
    },
  ],
  types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
  operators: [{ name: 'PSP' }],
}

export const cardiffPrisonWithWelshAddress: Prison = {
  prisonId: 'CFI',
  prisonName: 'HMP Cardiff',
  active: false,
  male: true,
  female: false,
  contracted: false,
  lthse: false,
  addresses: [
    {
      id: 16,
      addressLine1: '2 Knox Road',
      addressLine2: 'Merryweather',
      town: 'Cardiff',
      county: 'Glamorgan',
      postcode: 'CF24 0UG',
      country: 'Wales',
      addressLine1InWelsh: 'Heol Knox',
      addressLine2InWelsh: 'Merryweather',
      townInWelsh: 'Caerdydd',
      countyInWelsh: 'Glamorgan',
      countryInWelsh: 'Cymru',
    },
  ],
  types: [{ code: 'HMP', description: 'His Majesty’s Prison' }],
  operators: [{ name: 'PSP' }],
}
