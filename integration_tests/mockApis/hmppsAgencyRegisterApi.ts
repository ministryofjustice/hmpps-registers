import { SuperAgentRequest } from 'superagent'
import { stubFor, getRequests, resetScenarios } from './wiremock'
import {
  Court,
  Hospital,
  OtherAgency,
  PoliceCustodySuite,
  Prison,
  PrisonAddress,
  ProbationOffice,
  ApprovedPremises,
  PhoneNumber,
  CodeDescription,
  LegacyAgencyUsage,
} from '../../server/@types/prisonRegister'
import data from '../../server/routes/testutils/mockPrisonData'
import courtData from '../../server/routes/testutils/mockCourtData'
import otherAgencyData from '../../server/routes/testutils/mockOtherAgencyData'
import hospitalData from '../../server/routes/testutils/mockHospitalData'

// Mock API responses

const stubGetPayrollRegions = (payrollRegions: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: { method: 'GET', url: '/prison-register/reference-data/payroll-regions' },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: payrollRegions,
    },
  })

const stubGetLocalAuthorities = (localAuthorities: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: { method: 'GET', url: '/prison-register/reference-data/local-authorities' },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: localAuthorities,
    },
  })

const stubGetAreas = (areas: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: { method: 'GET', url: '/prison-register/reference-data/areas' },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: areas,
    },
  })

const stubGetRegions = (regions: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: { method: 'GET', url: '/prison-register/reference-data/regions' },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: regions,
    },
  })

const stubGetTownSuggestions = (suggestions: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/reference-data/suggestions/towns',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: suggestions,
    },
  })

const stubGetCountySuggestions = (suggestions: CodeDescription[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/reference-data/suggestions/counties',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: suggestions,
    },
  })

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

const stubFindPrison = (prison: Prison): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/prisons/id/TEST`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prison,
    },
  })

const stubAmendedPrison = (prison: Prison): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/prisons/id/TEST2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: prison,
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

const stubGetCourts = (courts: Court[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/courts.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courts,
    },
  })

const stubGetCourt = (court: Court): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/courts/id/${court.courtId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: court,
    },
  })

const createCourtScenario = (courtId: string) => `create-court-${courtId}`

const stubAgencyIdUsed = (agency: LegacyAgencyUsage): SuperAgentRequest =>
  stubFor({
    request: { method: 'GET', url: `/prison-register/legacy/agency/${agency.agencyId}/is-used` },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: agency,
    },
  })

// The agency ID is available until POST /courts creates the court, which can then be retrieved.
const stubCourtIdAvailable = async (court: Court): Promise<unknown> => {
  await resetScenarios()
  await stubFor({
    scenarioName: createCourtScenario(court.courtId),
    requiredScenarioState: 'Started',
    request: { method: 'GET', url: `/prison-register/legacy/agency/${court.courtId}/is-used` },
    response: {
      status: 204,
    },
  })
  return stubFor({
    scenarioName: createCourtScenario(court.courtId),
    requiredScenarioState: 'Created',
    request: { method: 'GET', url: `/prison-register/courts/id/${court.courtId}` },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: court,
    },
  })
}

const stubCreateCourt = (court: Court): SuperAgentRequest =>
  stubFor({
    scenarioName: createCourtScenario(court.courtId),
    newScenarioState: 'Created',
    request: {
      method: 'POST',
      url: '/prison-register/courts',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.courtId == '${court.courtId}')]` }],
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: court,
    },
  })

const stubCreateCourtError = (userMessage: string): SuperAgentRequest =>
  stubFor({
    request: { method: 'POST', url: '/prison-register/courts' },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 400, userMessage, developerMessage: userMessage },
    },
  })

const getCreatedCourts = (): Promise<Array<Record<string, unknown>>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'POST' && request.url === '/prison-register/courts',
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubAddCourtAddress = (courtId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/prison-register/courts/id/${courtId}/address`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { id: 100, town: 'Sheffield', postcode: 'S1 2BJ', country: 'England' },
    },
  })

const getAddedCourtAddresses = (courtId: string): Promise<Array<Record<string, string>>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'POST' && request.url === `/prison-register/courts/id/${courtId}/address`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubUpdateCourtAddress = ({ courtId, addressId }: { courtId: string; addressId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/courts/id/${courtId}/address/${addressId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courtData.address({
        id: addressId,
        town: 'Sheffield',
        postcode: 'S1 2BJ',
        country: 'England',
      }),
    },
  })

const getUpdatedCourtAddresses = ({
  courtId,
  addressId,
}: {
  courtId: string
  addressId: number
}): Promise<Array<Record<string, string>>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'PUT' && request.url === `/prison-register/courts/id/${courtId}/address/${addressId}`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubAddCourtPhoneNumber = (courtId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/prison-register/courts/id/${courtId}/phone-number`,
    },
    response: {
      status: 201,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { id: 100, number: '+44 114-555-9898' },
    },
  })

const getAddedCourtPhoneNumbers = (courtId: string): Promise<PhoneNumber[]> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'POST' && request.url === `/prison-register/courts/id/${courtId}/phone-number`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubUpdateCourtPhoneNumber = ({ courtId, phoneId }: { courtId: string; phoneId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/courts/id/${courtId}/phone-number/${phoneId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { id: phoneId, number: '+44 114-555-9898' },
    },
  })

const getUpdatedCourtPhoneNumbers = ({
  courtId,
  phoneId,
}: {
  courtId: string
  phoneId: number
}): Promise<PhoneNumber[]> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'PUT' && request.url === `/prison-register/courts/id/${courtId}/phone-number/${phoneId}`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubAddCourtEmailAddress = (courtId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/prison-register/courts/id/${courtId}/email-address`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { id: 100, address: 'new.email@example.com' },
    },
  })

const stubCourtMutationError = ({
  courtId,
  endpoint,
  method,
  userMessage,
}: {
  courtId: string
  endpoint: string
  method: 'POST' | 'PUT'
  userMessage: string
}): SuperAgentRequest =>
  stubFor({
    request: {
      method,
      urlPattern: `/prison-register/courts/id/${courtId}${endpoint ? `/${endpoint}` : ''}`,
    },
    response: {
      status: 400,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { userMessage },
    },
  })

const stubAddCourtEmailAddressError = ({
  courtId,
  userMessage,
}: {
  courtId: string
  userMessage: string
}): SuperAgentRequest =>
  stubCourtMutationError({
    courtId,
    endpoint: 'email-address',
    method: 'POST',
    userMessage,
  })

const stubUpdateCourt = (courtId: string): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/courts/id/${courtId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courtData.court({ courtId }),
    },
  })

const getUpdatedCourts = (courtId: string): Promise<Array<Record<string, unknown>>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'PUT' && request.url === `/prison-register/courts/id/${courtId}`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubUpdateCourtEmailAddress = ({ courtId, emailId }: { courtId: string; emailId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/prison-register/courts/id/${courtId}/email-address/${emailId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: { id: 100, address: 'new.email@example.com' },
    },
  })

const stubDeleteCourt = ({ courtId, status = 204 }: { courtId: string; status?: number }): SuperAgentRequest =>
  stubFor({
    request: { method: 'DELETE', url: `/prison-register/courts/id/${courtId}` },
    response: { status },
  })

const getDeletedCourtRequests = (courtId: string): Promise<number> =>
  getRequests().then(
    response =>
      response.body.requests.filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'DELETE' && request.url === `/prison-register/courts/id/${courtId}`,
      ).length,
  )

const stubDeleteCourtAddress = ({ courtId, addressId }: { courtId: string; addressId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `/prison-register/courts/id/${courtId}/address/${addressId}`,
    },
    response: { status: 204 },
  })

const getDeletedCourtAddressRequests = ({
  courtId,
  addressId,
}: {
  courtId: string
  addressId: number
}): Promise<number> =>
  getRequests().then(
    response =>
      response.body.requests.filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'DELETE' && request.url === `/prison-register/courts/id/${courtId}/address/${addressId}`,
      ).length,
  )

const stubDeleteCourtPhoneNumber = ({ courtId, phoneId }: { courtId: string; phoneId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `/prison-register/courts/id/${courtId}/phone-number/${phoneId}`,
    },
    response: {
      status: 204,
    },
  })

const getDeletedCourtPhoneNumberRequests = ({
  courtId,
  phoneId,
}: {
  courtId: string
  phoneId: number
}): Promise<number> =>
  getRequests().then(
    response =>
      response.body.requests.filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'DELETE' &&
          request.url === `/prison-register/courts/id/${courtId}/phone-number/${phoneId}`,
      ).length,
  )

const stubDeleteCourtEmailAddress = ({ courtId, emailId }: { courtId: string; emailId: number }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      urlPattern: `/prison-register/courts/id/${courtId}/email-address/${emailId}`,
    },
    response: {
      status: 204,
    },
  })

const getDeletedCourtEmailAddressRequests = ({
  courtId,
  emailId,
}: {
  courtId: string
  emailId: number
}): Promise<number> =>
  getRequests().then(
    response =>
      response.body.requests.filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'DELETE' &&
          request.url === `/prison-register/courts/id/${courtId}/email-address/${emailId}`,
      ).length,
  )

const getAddedCourtEmailAddresses = (courtId: string): Promise<Array<{ address: string }>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'POST' && request.url === `/prison-register/courts/id/${courtId}/email-address`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )
const getUpdatedCourtEmailAddresses = ({
  courtId,
  emailId,
}: {
  courtId: string
  emailId: number
}): Promise<Array<{ address: string }>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'PUT' && request.url === `/prison-register/courts/id/${courtId}/email-address/${emailId}`,
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubGetOtherAgencies = (otherAgencies: OtherAgency[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/other-agencies.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: otherAgencies,
    },
  })

const stubGetOtherAgency = (otherAgency: OtherAgency): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/other-agencies/id/${otherAgency.agencyId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: otherAgency,
    },
  })

const stubGetHospitals = (hospitals: Hospital[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/hospitals.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: hospitals,
    },
  })

const createHospitalScenario = (hospitalId: string) => `create-hospital-${hospitalId}`

// The agency ID is available until POST /hospitals creates the hospital, which can then be retrieved.
const stubHospitalIdAvailable = async (hospital: Hospital): Promise<unknown> => {
  await resetScenarios()
  await stubFor({
    scenarioName: createHospitalScenario(hospital.hospitalId),
    requiredScenarioState: 'Started',
    request: { method: 'GET', url: `/prison-register/legacy/agency/${hospital.hospitalId}/is-used` },
    response: { status: 204 },
  })
  return stubFor({
    scenarioName: createHospitalScenario(hospital.hospitalId),
    requiredScenarioState: 'Created',
    request: { method: 'GET', url: `/prison-register/hospitals/id/${hospital.hospitalId}` },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: hospital,
    },
  })
}

const stubCreateHospital = (hospital: Hospital): SuperAgentRequest =>
  stubFor({
    scenarioName: createHospitalScenario(hospital.hospitalId),
    newScenarioState: 'Created',
    request: {
      method: 'POST',
      url: '/prison-register/hospitals',
      bodyPatterns: [{ matchesJsonPath: `$[?(@.hospitalId == '${hospital.hospitalId}')]` }],
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: hospital,
    },
  })

const stubCreateHospitalError = (userMessage: string): SuperAgentRequest =>
  stubFor({
    request: { method: 'POST', url: '/prison-register/hospitals' },
    response: {
      status: 400,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 400, userMessage, developerMessage: userMessage },
    },
  })

const getCreatedHospitals = (): Promise<Array<Record<string, unknown>>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === 'POST' && request.url === '/prison-register/hospitals',
      )
      .map(({ request }: { request: { body: string } }) => JSON.parse(request.body)),
  )

const stubGetHospital = (hospital: Hospital): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/hospitals/id/${hospital.hospitalId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: hospital,
    },
  })

type HospitalApiCall = { hospitalId: string; endpoint?: string; method: 'POST' | 'PUT' | 'DELETE' }

const hospitalApiPath = ({ hospitalId, endpoint }: HospitalApiCall) =>
  `/prison-register/hospitals/id/${hospitalId}${endpoint ? `/${endpoint}` : ''}`

const stubHospitalApi = ({
  status = 200,
  jsonBody,
  ...call
}: HospitalApiCall & { status?: number; jsonBody?: unknown }): SuperAgentRequest =>
  stubFor({
    request: { method: call.method, urlPattern: hospitalApiPath(call) },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody,
    },
  })

const stubHospitalApiError = (call: HospitalApiCall & { userMessage: string }): SuperAgentRequest =>
  stubHospitalApi({ ...call, status: 400, jsonBody: { userMessage: call.userMessage } })

const getHospitalApiRequests = (call: HospitalApiCall): Promise<Array<Record<string, unknown> | null>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === call.method && request.url === hospitalApiPath(call),
      )
      .map(({ request }: { request: { body?: string } }) => (request.body ? JSON.parse(request.body) : null)),
  )

const stubGetPoliceCustodySuites = (policeCustodySuites: PoliceCustodySuite[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/police-custody-suites.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: policeCustodySuites,
    },
  })

const stubGetPoliceCustodySuite = (policeCustodySuite: PoliceCustodySuite): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/police-custody-suites/id/${policeCustodySuite.policeCustodySuiteId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: policeCustodySuite,
    },
  })

type PoliceCustodySuiteApiCall = {
  policeCustodySuiteId: string
  endpoint?: string
  method: 'POST' | 'PUT' | 'DELETE'
}

const policeCustodySuiteApiPath = ({ policeCustodySuiteId, endpoint }: PoliceCustodySuiteApiCall) =>
  `/prison-register/police-custody-suites/id/${policeCustodySuiteId}${endpoint ? `/${endpoint}` : ''}`

const stubPoliceCustodySuiteApi = ({
  status = 200,
  jsonBody,
  ...call
}: PoliceCustodySuiteApiCall & { status?: number; jsonBody?: unknown }): SuperAgentRequest =>
  stubFor({
    request: { method: call.method, urlPattern: policeCustodySuiteApiPath(call) },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody,
    },
  })

const stubPoliceCustodySuiteApiError = (call: PoliceCustodySuiteApiCall & { userMessage: string }): SuperAgentRequest =>
  stubPoliceCustodySuiteApi({ ...call, status: 400, jsonBody: { userMessage: call.userMessage } })

const getPoliceCustodySuiteApiRequests = (
  call: PoliceCustodySuiteApiCall,
): Promise<Array<Record<string, unknown> | null>> =>
  getRequests().then(response =>
    response.body.requests
      .filter(
        ({ request }: { request: { method: string; url: string } }) =>
          request.method === call.method && request.url === policeCustodySuiteApiPath(call),
      )
      .map(({ request }: { request: { body?: string } }) => (request.body ? JSON.parse(request.body) : null)),
  )

const stubGetProbationOffices = (probationOffices: ProbationOffice[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/probation-offices.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: probationOffices,
    },
  })

const stubGetProbationOffice = (probationOffice: ProbationOffice): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/probation-offices/id/${probationOffice.probationOfficeId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: probationOffice,
    },
  })

const stubGetAllApprovedPremises = (approvedPremisesList: ApprovedPremises[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register/approved-premises.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: approvedPremisesList,
    },
  })

const stubGetApprovedPremises = (approvedPremises: ApprovedPremises): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/prison-register/approved-premises/id/${approvedPremises.approvedPremisesId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: approvedPremises,
    },
  })

export default {
  stubGetPayrollRegions,
  stubGetLocalAuthorities,
  stubGetAreas,
  stubGetRegions,
  stubGetTownSuggestions,
  stubGetCountySuggestions,
  stubPing,
  stubGetPrisonsWithFilter,
  stubAddPrison,
  stubGetPrison,
  stubFindPrison,
  stubAmendedPrison,
  stubUpdatePrison,
  stubGetPrisonAddress,
  stubUpdatePrisonAddress,
  stubAddPrisonAddress,
  stubDeletePrisonAddress,
  stubPutWelshPrisonAddress,
  stubGetCourts,
  stubGetCourt,
  stubDeleteCourt,
  getDeletedCourtRequests,
  stubAgencyIdUsed,
  stubCourtIdAvailable,
  stubCreateCourt,
  stubCreateCourtError,
  getCreatedCourts,
  stubAddCourtAddress,
  getAddedCourtAddresses,
  stubUpdateCourtAddress,
  getUpdatedCourtAddresses,
  stubDeleteCourtAddress,
  getDeletedCourtAddressRequests,
  stubAddCourtPhoneNumber,
  getAddedCourtPhoneNumbers,
  stubUpdateCourtPhoneNumber,
  getUpdatedCourtPhoneNumbers,
  stubDeleteCourtPhoneNumber,
  getDeletedCourtPhoneNumberRequests,
  stubAddCourtEmailAddress,
  stubAddCourtEmailAddressError,
  stubCourtMutationError,
  stubUpdateCourtEmailAddress,
  stubUpdateCourt,
  getUpdatedCourts,
  stubDeleteCourtEmailAddress,
  getAddedCourtEmailAddresses,
  getUpdatedCourtEmailAddresses,
  getDeletedCourtEmailAddressRequests,
  stubGetOtherAgencies,
  stubGetOtherAgency,
  stubGetHospitals,
  stubGetHospital,
  stubHospitalIdAvailable,
  stubCreateHospital,
  stubCreateHospitalError,
  getCreatedHospitals,
  stubHospitalApi,
  stubHospitalApiError,
  getHospitalApiRequests,
  stubGetPoliceCustodySuites,
  stubGetPoliceCustodySuite,
  stubPoliceCustodySuiteApi,
  stubPoliceCustodySuiteApiError,
  getPoliceCustodySuiteApiRequests,
  stubGetProbationOffices,
  stubGetProbationOffice,
  stubGetAllApprovedPremises,
  stubGetApprovedPremises,
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
  categories: [],
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
  categories: [],
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
  categories: [],
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

export const sheffieldCrownCourt: Court = courtData.court({
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  active: true,
  courtType: { code: 'CC', description: 'Crown Court' },
})

export const sheffieldPecsAgency: OtherAgency = otherAgencyData.otherAgency({
  agencyId: 'SHFPECS',
  agencyName: 'Sheffield PECS Agency',
  active: true,
  agencyType: 'PECS',
})

export const rampton: Hospital = hospitalData.hospital({
  hospitalId: 'RAMPTON',
  hospitalName: 'Rampton Secure Hospital',
  active: true,
  highSecurity: true,
})
