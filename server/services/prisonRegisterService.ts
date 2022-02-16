import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { Prison } from '../@types/prisonRegister'

export interface Context {
  username?: string
}

export default class PrisonRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('PrisonRegister API Client', config.apis.prisonRegister, token)
  }

  async getPrisons(context: Context): Promise<Prison[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prisons`)
    return PrisonRegisterService.restClient(token).get<Prison[]>({
      path: `/prisons`,
    })
  }
}
