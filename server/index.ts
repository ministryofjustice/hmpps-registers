import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'
import CourtRegisterService from './services/courtRegisterService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)
const courtRegisterService = new CourtRegisterService(hmppsAuthClient)

const app = createApp(userService, courtRegisterService)

export default app
