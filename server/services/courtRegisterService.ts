import type {
  Court,
  CourtsPage,
  CourtType,
  UpdateCourt,
  InsertCourt,
  InsertCourtBuilding,
  InsertCourtBuildingContact,
  CourtBuilding,
  CourtBuildingContact,
} from '../@types/courtRegister'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'

export interface AllCourts {
  courts: Array<Court>
}

export interface AddCourt {
  court: InsertCourt
  building: InsertCourtBuilding
  contacts: InsertCourtBuildingContact[]
}

export interface AddUpdateResponse {
  success: boolean
  errorMessage?: string
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

  async getPageOfCourts(context: Context, pageNumber: number, pageSize: number): Promise<CourtsPage> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for page of courts`)
    return (await CourtRegisterService.restClient(token).get({
      path: `/courts/all/paged`,
      query: `page=${pageNumber}&size=${pageSize}&sort=courtName`,
    })) as CourtsPage
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for court ${courtId}`)
    return (await CourtRegisterService.restClient(token).get({ path: `/courts/id/${courtId}` })) as Court
  }

  async findCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for court ${courtId}`)
    return (await CourtRegisterService.restClient(token).get({
      path: `/courts/id/${courtId}`,
      additionalStatusChecker: status => status === 404,
    })) as Court
  }

  async updateActiveMarker(context: Context, courtId: string, active: boolean): Promise<void> {
    const court: Court = await this.getCourt(context, courtId)
    const updatedCourt: UpdateCourt = { ...court, active }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Updating court ${courtId}`)
    await CourtRegisterService.restClient(token).put({ path: `/court-maintenance/id/${courtId}`, data: updatedCourt })
  }

  async addCourt(context: Context, addCourt: AddCourt): Promise<AddUpdateResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Creating court ${addCourt.court.courtId}`)
    const createdCourt = (await CourtRegisterService.restClient(token).post({
      path: `/court-maintenance`,
      data: addCourt.court,
      additionalStatusChecker: status => status === 400,
    })) as Court & { status: number; error: string; message: string }
    if (createdCourt.error) {
      logger.error(`failed to create court ${addCourt.court.courtId}`)
      return {
        success: false,
        errorMessage: createdCourt.message,
      }
    }
    logger.info(`court ${createdCourt.courtId} created`)
    const createdBuilding = (await CourtRegisterService.restClient(token).post({
      path: `/court-maintenance/id/${createdCourt.courtId}/buildings`,
      data: addCourt.building,
    })) as CourtBuilding

    logger.info(`court building ${createdBuilding.id} created`)
    const createdContacts = (await Promise.all(
      addCourt.contacts.map(contact => {
        return CourtRegisterService.restClient(token).post({
          path: `/court-maintenance/id/${createdCourt.courtId}/buildings/${createdBuilding.id}/contacts`,
          data: contact,
        })
      })
    )) as CourtBuildingContact[]

    createdContacts.forEach(createdContact => {
      logger.info(`court building contact ${createdContact.id} created`)
    })

    return { success: true }
  }

  async getCourtTypes(context: Context): Promise<Array<CourtType>> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all court types`)
    return (await CourtRegisterService.restClient(token).get({ path: `/courts/types` })) as Array<CourtType>
  }
}
