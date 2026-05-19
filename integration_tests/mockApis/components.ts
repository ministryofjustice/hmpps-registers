import { stubFor } from './wiremock'

const stubComponentsPing = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/components-api/health',
    },
    response: {
      status: 200,
    },
  })

export default {
  stubComponentsPing,
}
