const page = require('./page')

const row = (type, i) => cy.get(`[data-qa=${type}] tbody tr`).eq(i)
const col = (i, j) => row('courts', i).find('td').eq(j)

const courtRegister = () =>
  page('Court Register', {
    courts: i => ({
      code: () => col(i, 0),
      name: () => col(i, 1),
      type: () => col(i, 2),
      status: () => col(i, 3),
    }),
  })

module.exports = { verifyOnPage: courtRegister }
