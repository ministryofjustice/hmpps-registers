import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'

export interface Court {
  courtId: string
  courtName: string
  courtDescription: string
  courtType: string
  active: boolean
}

export interface AllCourts {
  courts: Array<Court>
}

export interface Context {
  username?: string
}
export default class CourtRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private restClient(token: string): RestClient {
    return new RestClient('CourtRegister API Client', config.apis.courtRegister, token)
  }

  async getAllCourts(context: Context): Promise<AllCourts> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for all courts`)
    return { courts: await this.restClient(token).get({ path: `/courts/all` }) } as AllCourts
  }
}
