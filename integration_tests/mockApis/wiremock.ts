import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = `${process.env.WIREMOCK_URL || 'http://localhost:9091'}/__admin`

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const getMatchingRequests = (body: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/requests/find`).send(body)

const resetScenarios = (): SuperAgentRequest => superagent.post(`${url}/scenarios/reset`)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export { stubFor, getRequests, getMatchingRequests, resetStubs, resetScenarios }
