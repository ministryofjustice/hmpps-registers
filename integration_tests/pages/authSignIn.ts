import page from './page'
import type { Page } from './page'

export default {
  verifyOnPage: (): Page => page('Sign in', {}),
}
