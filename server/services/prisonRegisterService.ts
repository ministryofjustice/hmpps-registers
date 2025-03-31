import querystring from 'querystring'
import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import {
  Prison,
  UpdatePrison,
  PrisonAddress,
  UpdatePrisonAddress,
  InsertPrison,
  UpdateWelshPrisonAddress,
} from '../@types/prisonRegister'
import { AllPrisonsFilter } from '../routes/prisonRegister/prisonMapper'

export interface Context {
  username?: string
}

export interface AddUpdateResponse {
  success: boolean
  errorMessage?: string
}

type ServerError = { status: number; error: string; message: string }

export default class PrisonRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Prison Register Api Client', config.apis.prisonRegister, token)
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
    return PrisonRegisterService.restClient(token).get<Prison>({ path: `/prisons/id/${prisonId}` })
  }

  async findPrison(context: Context, prisonId: string): Promise<Prison | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for prison ${prisonId}`)
    return PrisonRegisterService.restClient(token).get<Prison | undefined>({
      path: `/prisons/id/${prisonId}`,
      additionalStatusChecker: status => status === 404,
    })
  }

  async getPrisonAddress(context: Context, prisonId: string, addressId: string): Promise<PrisonAddress> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prisonId ${prisonId} address ${addressId}`)
    return PrisonRegisterService.restClient(token).get<PrisonAddress>({
      path: `/prisons/id/${prisonId}/address/${addressId}`,
    })
  }

  async addPrison(context: Context, insertPrison: InsertPrison): Promise<AddUpdateResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Creating prison ${insertPrison.prisonId}`)
    const prisonOrError = await PrisonRegisterService.restClient(token).post<Prison & ServerError>({
      path: `/prison-maintenance`,
      data: insertPrison,
      additionalStatusChecker: status => status === 400,
    })
    if (prisonOrError.error) {
      logger.error(`failed to create prison ${insertPrison.prisonId}`)
      return {
        success: false,
        errorMessage: prisonOrError.message,
      }
    }
    return { success: true }
  }

  async updatePrisonDetails(
    context: Context,
    prisonId: string,
    prisonName: string,
    prisonNameInWelsh: string,
    contracted: string,
    lthse: string,
    male: boolean,
    female: boolean,
    prisonTypes: UpdatePrison['prisonTypes'],
  ): Promise<void> {
    const prison: Prison = await this.getPrison(context, prisonId)
    const isContracted = contracted === 'yes'
    const isLthse = lthse === 'yes'

    const updatedPrison: UpdatePrison = {
      active: prison.active,
      contracted: isContracted,
      lthse: isLthse,
      prisonName,
      male,
      female,
      prisonTypes,
      prisonNameInWelsh,
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
    prisonAddress: UpdatePrisonAddress,
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

  async updateAddressWithWelshPrisonAddress(
    context: Context,
    prisonId: string,
    addressId: string,
    welshAddress: UpdateWelshPrisonAddress,
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Amending Welsh prison ${prisonId} address for ${addressId}`)
    await PrisonRegisterService.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}/welsh-address/${addressId}`,
      data: welshAddress,
    })
  }

  async deletePrisonAddress(context: Context, prisonId: string, addressId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Deleting prison address for prison ${prisonId} and address ${addressId}`)
    await PrisonRegisterService.restClient(token).delete({
      path: `/prison-maintenance/id/${prisonId}/address/${addressId}`,
    })
  }

  async addPrisonAddress(context: Context, prisonId: string, prisonAddress: UpdatePrisonAddress): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Adding address to prison ${prisonId}`)
    await PrisonRegisterService.restClient(token).post({
      path: `/prison-maintenance/id/${prisonId}/address`,
      data: {
        ...prisonAddress,
        addressLine1: undefinedWhenAbsent(prisonAddress.addressLine1),
        addressLine2: undefinedWhenAbsent(prisonAddress.addressLine2),
        county: undefinedWhenAbsent(prisonAddress.county),
      },
    })
  }

  async updateActivePrisonMarker(context: Context, prisonId: string, active: boolean): Promise<void> {
    const prison: Prison = await this.getPrison(context, prisonId)
    const prisonTypes = prison.types.map(type => type.code)
    const { prisonName, male, female, contracted, lthse } = prison
    const updatedPrison: UpdatePrison = { active, prisonName, male, female, contracted, lthse, prisonTypes }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Updating Prison ${prisonId} with active=${active}`)
    await PrisonRegisterService.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}`,
      data: updatedPrison,
    })
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
