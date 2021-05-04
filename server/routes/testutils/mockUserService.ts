import UserService, { UserDetails } from '../../services/userService'
import HmppsAuthClient from '../../data/hmppsAuthClient'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
}

export default class MockUserService extends UserService {
  constructor() {
    super({} as HmppsAuthClient)
  }

  async getUser(token: string): Promise<UserDetails> {
    return {
      token,
      ...user,
    } as UserDetails
  }
}
