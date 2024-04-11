import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import { createRedisClient } from './data/redisClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import PrisonRegisterService from './services/prisonRegisterService'
import { createMetricsApp } from './monitoring/metricsApp'
import ManageUsersApiClient from './data/manageUsersApiClient'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false })))
const manageUsersApiClient = new ManageUsersApiClient()

const userService = new UserService(manageUsersApiClient)
const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)

const app = createApp(userService, prisonRegisterService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
