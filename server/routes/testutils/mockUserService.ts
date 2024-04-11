import UserService, { UserDetails } from '../../services/userService'
import ManageUsersApiClient from '../../data/manageUsersApiClient'

const user: UserDetails = {
  name: 'john smith',
  username: 'user1',
  displayName: 'John Smith',
  roles: [],
}

export default class MockUserService extends UserService {
  constructor() {
    super({} as ManageUsersApiClient)
  }

  async getUser(token: string): Promise<UserDetails> {
    return {
      token,
      ...user,
    } as UserDetails
  }
}
