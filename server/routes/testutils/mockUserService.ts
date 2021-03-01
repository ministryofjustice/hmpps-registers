import UserService, { UserDetails } from '../../services/userService'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
}

export default class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string): Promise<UserDetails> {
    return {
      token,
      ...user,
    } as UserDetails
  }
}
