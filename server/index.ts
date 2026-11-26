import { AuditServiceFactory } from '@ministryofjustice/hmpps-audit-client'
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import createApp from './app'
import UserService from './services/userService'
import HMPPSAgencyRegisterApi from './services/hmppsAgencyRegisterApi'
import ManageUsersApiClient from './data/manageUsersApiClient'
import { createRedisClient } from './data/redisClient'
import applicationInfoSupplier from './applicationInfo'
import config from './config'
import logger from '../logger'

const applicationInfo = applicationInfoSupplier()

const hmppsAuthClient = new AuthenticationClient(
  config.apis.hmppsAuth,
  logger,
  config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
)
const manageUsersApiClient = new ManageUsersApiClient()

const userService = new UserService(manageUsersApiClient)
const hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)

const auditService = AuditServiceFactory.createInstance(config.sqs.audit, logger)

const app = createApp(userService, hmppsAgencyRegisterApiService, applicationInfo, auditService)

export default app
