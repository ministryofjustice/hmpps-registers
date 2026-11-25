import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'
import config from '../config'

export interface User {
  username: string
  name?: string
  active?: boolean
  authSource?: string
  uuid?: string
  userId?: string
  activeCaseLoadId?: string // Will be removed from User. For now, use 'me/caseloads' endpoint in 'nomis-user-roles-api'
}

export interface UserRole {
  roleCode: string
}

export default class ManageUsersApiClient extends RestClient {
  constructor() {
    super('Manage Users Api Client', config.apis.manageUsersApi, logger)
  }

  getUser(token: string): Promise<User> {
    logger.info('Getting user details: calling HMPPS Manage Users Api')
    return this.get<User>({ path: '/users/me' }, asUser(token))
  }
}
