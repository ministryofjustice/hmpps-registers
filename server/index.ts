import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore/redisTokenStore'
import UserService from './services/userService'
import PrisonRegisterService from './services/prisonRegisterService'
import { createMetricsApp } from './monitoring/metricsApp'
import ManageUsersApiClient from './data/manageUsersApiClient'
import { createRedisClient } from './data/redisClient'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
const manageUsersApiClient = new ManageUsersApiClient()

const userService = new UserService(manageUsersApiClient)
const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)

const app = createApp(userService, prisonRegisterService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
