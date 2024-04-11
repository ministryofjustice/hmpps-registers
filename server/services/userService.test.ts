import UserService from './userService'
import ManageUsersApiClient from '../data/manageUsersApiClient'

jest.mock('../data/hmppsAuthClient')

const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJoZWxsbyI6IndvcmxkIiwiaWF0IjoxNzEyODMzNTgxfQ.msHZ1pMy8FoZkFyODFViloAD4jVcxxHrTRvCVmRd1uc'

describe('User service', () => {
  let manageUsersApiClient: jest.Mocked<ManageUsersApiClient>
  let userService: UserService

  describe('getUser', () => {
    beforeEach(() => {
      manageUsersApiClient = new ManageUsersApiClient() as jest.Mocked<ManageUsersApiClient>
      userService = new UserService(manageUsersApiClient)
    })

    it('Retrieves and formats user name', async () => {
      manageUsersApiClient.getUser = jest.fn().mockResolvedValue({ name: 'john smith', username: 'JSMITH' })

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('Propagates error', async () => {
      manageUsersApiClient.getUser = jest.fn().mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })
})
