import page, { Page } from './page'

export default {
  verifyOnPage: (): Page => page('Sign in', {}),
}
