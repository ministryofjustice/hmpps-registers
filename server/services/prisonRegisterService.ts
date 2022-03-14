import querystring from 'querystring'
import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { Prison, UpdatePrison, PrisonAddress, UpdatePrisonAddress } from '../@types/prisonRegister'
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

  async getPrisonAddress(context: Context, prisonId: string, addressId: string): Promise<PrisonAddress> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prisonId ${prisonId} address ${addressId}`)
    return PrisonRegisterService.restClient(token).get<PrisonAddress>({
      path: `/prisons/id/${prisonId}/address/${addressId}`,
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

  async updatePrisonAddress(
    context: Context,
    prisonId: string,
    addressId: string,
    prisonAddress: UpdatePrisonAddress
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Amending prison ${prisonId} address for ${addressId}`)
    await PrisonRegisterService.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}/address/${addressId}`,
      data: {
        ...prisonAddress,
        addressLine1: undefinedWhenAbsent(prisonAddress.addressLine1),
        addressLine2: undefinedWhenAbsent(prisonAddress.addressLine2),
        county: undefinedWhenAbsent(prisonAddress.county),
      },
    })
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
