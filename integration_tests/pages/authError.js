const page = require('./page')

const authErrorPage = () => page('Authorisation Error', {})

module.exports = { verifyOnPage: authErrorPage }
