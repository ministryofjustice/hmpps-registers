const page = require('../page')

const courtDetails = courtName => page(courtName, {})

module.exports = { verifyOnPage: courtDetails }
