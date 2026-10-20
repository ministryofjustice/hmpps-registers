import createApp from './app'
import HmppsAuthClient from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore/redisTokenStore'
import UserService from './services/userService'
import HMPPSAgencyRegisterApi from './services/hmppsAgencyRegisterApi'
import ManageUsersApiClient from './data/manageUsersApiClient'
import { createRedisClient } from './data/redisClient'
import applicationInfoSupplier from './applicationInfo'

const applicationInfo = applicationInfoSupplier()

const hmppsAuthClient = new HmppsAuthClient(new TokenStore(createRedisClient()))
const manageUsersApiClient = new ManageUsersApiClient()

const userService = new UserService(manageUsersApiClient)
const hmppsAgencyRegisterApiService = new HMPPSAgencyRegisterApi(hmppsAuthClient)

const app = createApp(userService, hmppsAgencyRegisterApiService, applicationInfo)

export default app
