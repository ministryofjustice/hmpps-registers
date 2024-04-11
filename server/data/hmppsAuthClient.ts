import superagent from 'superagent'
import { URLSearchParams } from 'url'
import type TokenStore from './tokenStore'

import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  return getClientTokenFromHmppsAuth(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
    username,
  )
}

function getApiClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  return getClientTokenFromHmppsAuth(config.apis.hmppsAuth.apiClientId, config.apis.hmppsAuth.apiClientSecret, username)
}

function getClientTokenFromHmppsAuth(
  clientId: string,
  clientSecret: string,
  username?: string,
): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(clientId, clientSecret)

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`HMPPS Auth request '${grantRequest}' for client id '${clientId}' and user '${username}'`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export interface User {
  name: string
  activeCaseLoadId: string
}

export interface UserRole {
  roleCode: string
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }

  async getApiClientToken(username?: string): Promise<string> {
    const key = `API${username || '%ANONYMOUS%'}`

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getApiClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}
