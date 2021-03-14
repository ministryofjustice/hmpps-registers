import page from './page'
import type { Page } from './page'

const authErrorPage = (): Page => page('Authorisation Error', {})

export default { verifyOnPage: authErrorPage }
