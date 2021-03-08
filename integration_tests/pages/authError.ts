import page, { Page } from './page'

const authErrorPage = (): Page => page('Authorisation Error', {})

export default { verifyOnPage: authErrorPage }
