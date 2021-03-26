import type { Court, CourtType, UpdateCourt } from 'courtRegister'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'

export interface AllCourts {
  courts: Array<Court>
}

export interface Context {
  username?: string
}
export default class CourtRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('CourtRegister API Client', config.apis.courtRegister, token)
  }

  async getAllCourts(context: Context): Promise<AllCourts> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for all courts`)
    return { courts: await CourtRegisterService.restClient(token).get({ path: `/courts/all` }) } as AllCourts
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for court ${courtId}`)
    return (await CourtRegisterService.restClient(token).get({ path: `/courts/id/${courtId}` })) as Court
  }

  async updateActiveMarker(context: Context, courtId: string, active: boolean): Promise<void> {
    const court: Court = await this.getCourt(context, courtId)
    const updatedCourt: UpdateCourt = { ...court, active }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Updating court ${courtId}`)
    await CourtRegisterService.restClient(token).put({ path: `/court-maintenance/id/${courtId}`, data: updatedCourt })
  }

  async getCourtTypes(context: Context): Promise<Array<CourtType>> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all court types`)
    return (await CourtRegisterService.restClient(token).get({ path: `/courts/types` })) as Array<CourtType>
  }
}
