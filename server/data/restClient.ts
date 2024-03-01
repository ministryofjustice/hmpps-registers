import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'

interface GetRequest {
  path?: string
  query?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
  additionalStatusChecker?: (status: number) => boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
  additionalStatusChecker?: (status: number) => boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

type PutRequest = PostRequest
type DeleteRequest = PostRequest

export default class RestClient {
  agent: Agent

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  defaultErrorLogger(error: UnsanitisedError): void {
    logger.warn(sanitiseError(error), `Error calling ${this.name}`)
  }

  async get<T>({
    path,
    query = '',
    headers = {},
    responseType = '',
    raw = false,
    additionalStatusChecker = () => false,
  }: GetRequest): Promise<T> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path} ${query}`)
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .ok(res => (res.status >= 200 && res.status < 300) || additionalStatusChecker(res.status))
        .agent(this.agent)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      if (result.notFound) {
        return undefined as unknown as T
      }

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post<T>({
    path,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
    additionalStatusChecker = () => false,
  }: PostRequest = {}): Promise<T> {
    logger.info(`Post using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .ok(res => (res.status >= 200 && res.status < 300) || additionalStatusChecker(res.status))
        .agent(this.agent)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  async put({ path, headers = {}, responseType = '', data = {}, raw = false }: PutRequest = {}): Promise<unknown> {
    logger.info(`Put using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .put(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
      throw sanitisedError
    }
  }

  async delete({ path, headers = {}, responseType = '', raw = false }: DeleteRequest = {}): Promise<unknown> {
    logger.info(`Delete using user credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .delete(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
      throw sanitisedError
    }
  }

  async stream({ path, headers = {}, errorLogger = this.defaultErrorLogger }: StreamRequest = {}): Promise<unknown> {
    logger.info(`Get using user credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .retry(2, err => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            errorLogger(error)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }
}
