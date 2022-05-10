import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import CourtRegisterService from './services/courtRegisterService'
import PrisonRegisterService from './services/prisonRegisterService'
import { createMetricsApp } from './monitoring/metricsApp'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const courtRegisterService = new CourtRegisterService(hmppsAuthClient)
const prisonRegisterService = new PrisonRegisterService(hmppsAuthClient)

const app = createApp(userService, courtRegisterService, prisonRegisterService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
