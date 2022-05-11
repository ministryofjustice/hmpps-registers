import promClient from 'prom-client'
import createApp from './app'
import { createMetricsApp } from './monitoring/metricsApp'
import { createRedisClient } from './data/redisClient'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import CourtRegisterService from './services/courtRegisterService'
import PrisonRegisterService from './services/prisonRegisterService'

promClient.collectDefaultMetrics()

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false })))
const userService = new UserService(hmppsAuthClient)
const courtRegisterService = new CourtRegisterService(hmppsAuthClient)
const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)

const app = createApp(userService, courtRegisterService, prisonRegisterService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
