import querystring from 'querystring'
import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { Prison, UpdatePrison } from '../@types/prisonRegister'
import { AllPrisonsFilter } from '../routes/prisonRegister/prisonMapper'

export interface Context {
  username?: string
}

export default class PrisonRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('PrisonRegister API Client', config.apis.prisonRegister, token)
  }

  async getPrisonsWithFilter(context: Context, filter: AllPrisonsFilter): Promise<Prison[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prisons with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<Prison[]>({
      path: `/prisons/search`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getPrison(context: Context, prisonId: string): Promise<Prison> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prison ${prisonId}`)
    return PrisonRegisterService.restClient(token).get<Prison>({
      path: `/prisons/id/${prisonId}`,
    })
  }

  async updatePrisonDetails(context: Context, prisonId: string, prisonName: string): Promise<void> {
    const prison: Prison = await this.getPrison(context, prisonId)
    const updatedPrison: UpdatePrison = {
      active: prison.active,
      prisonName,
    }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Amending prison details for ${prisonId}`)
    await PrisonRegisterService.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}`,
      data: updatedPrison,
    })
  }
}
