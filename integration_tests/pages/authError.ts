import page from './page'
import type { Page } from './page'

const verifyOnPage = (): Page => page('Authorisation Error', {})

export default { verifyOnPage }
