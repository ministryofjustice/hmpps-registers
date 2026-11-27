import { Page } from '@playwright/test'
import auth from './mockApis/auth'
import manageUsersApi from './mockApis/manageUsersApi'
import { getMatchingRequests, resetStubs } from './mockApis/wiremock'

export { resetStubs }

const DEFAULT_ROLES = ['ROLE_HMPPS_REGISTERS_MAINTAINER']

type AuthorizeRequest = { loggedDate: number; queryParams: { state: { values: string[] } } }

/**
 * Builds the sign-in callback URL from the state the app sent on its latest redirect to HMPPS Auth.
 */
const getSignInUrl = async (): Promise<string> => {
  const { body } = await getMatchingRequests({ method: 'GET', urlPath: '/auth/oauth/authorize' })
  const requests = body.requests as AuthorizeRequest[]
  const latest = requests.reduce((a, b) => (b.loggedDate > a.loggedDate ? b : a))
  return `/sign-in/callback?code=codexxxx&state=${latest.queryParams.state.values[0]}`
}

/**
 * Starts signing in: the app redirects to the stubbed HMPPS Auth, then the test completes the
 * callback itself. The response is that of the callback, which may be an error page.
 */
export const attemptSignIn = async (page: Page) => {
  await page.goto('/')
  return page.goto(await getSignInUrl())
}

export const signIn = async (page: Page, { roles = DEFAULT_ROLES }: { roles?: string[] } = {}) => {
  await Promise.all([auth.stubSignIn(roles), manageUsersApi.stubManageUser()])
  return attemptSignIn(page)
}
