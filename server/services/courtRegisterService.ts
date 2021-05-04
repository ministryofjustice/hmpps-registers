import querystring from 'querystring'
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
  UpdateCourtBuilding,
  UpdateCourtBuildingContact,
} from '../@types/courtRegister'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import { AllCourtsFilter } from '../routes/courtRegister/courtMapper'

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

type ServerError = { status: number; error: string; message: string }
type NewOrExistingContact = UpdateCourtBuildingContact & { id?: string }

export default class CourtRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('CourtRegister API Client', config.apis.courtRegister, token)
  }

  async getAllCourts(context: Context): Promise<AllCourts> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for all courts`)
    return { courts: await CourtRegisterService.restClient(token).get<Court[]>({ path: `/courts/all` }) }
  }

  async getPageOfCourts(
    context: Context,
    pageNumber: number,
    pageSize: number,
    filter: AllCourtsFilter
  ): Promise<CourtsPage> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for page of courts with filter ${filter}`)
    return CourtRegisterService.restClient(token).get<CourtsPage>({
      path: `/courts/paged`,
      query: `page=${pageNumber}&size=${pageSize}&sort=courtName&${querystring.stringify(filter)}`,
    })
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for court ${courtId}`)
    return CourtRegisterService.restClient(token).get<Court>({ path: `/courts/id/${courtId}` })
  }

  async findCourt(context: Context, courtId: string): Promise<Court | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for court ${courtId}`)
    return CourtRegisterService.restClient(token).get<Court | undefined>({
      path: `/courts/id/${courtId}`,
      additionalStatusChecker: status => status === 404,
    })
  }

  async findCourtBuilding(context: Context, subCode: string): Promise<CourtBuilding | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for court building ${subCode}`)
    return CourtRegisterService.restClient(token).get<CourtBuilding | undefined>({
      path: `/courts/buildings/sub-code/${subCode}`,
      additionalStatusChecker: status => status === 404,
    })
  }

  async updateActiveMarker(context: Context, courtId: string, active: boolean): Promise<void> {
    const court: Court = await this.getCourt(context, courtId)
    const { courtName, courtDescription } = court
    const { courtType } = court.type
    const updatedCourt: UpdateCourt = { courtName, courtDescription, courtType, active }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Updating court ${courtId}`)
    await CourtRegisterService.restClient(token).put({ path: `/court-maintenance/id/${courtId}`, data: updatedCourt })
  }

  async updateCourtDetails(
    context: Context,
    courtId: string,
    courtName: string,
    courtType: string,
    courtDescription: string
  ): Promise<void> {
    const court: Court = await this.getCourt(context, courtId)
    const updatedCourt: UpdateCourt = {
      active: court.active,
      courtName,
      courtType,
      courtDescription: undefinedWhenAbsent(courtDescription),
    }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Amending court details for ${courtId}`)
    await CourtRegisterService.restClient(token).put({ path: `/court-maintenance/id/${courtId}`, data: updatedCourt })
  }

  async updateCourtBuilding(
    context: Context,
    courtId: string,
    buildingId: string,
    courtBuilding: UpdateCourtBuilding
  ): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Amending court ${courtId} building for ${buildingId}`)
    await CourtRegisterService.restClient(token).put({
      path: `/court-maintenance/id/${courtId}/buildings/${buildingId}`,
      data: {
        ...courtBuilding,
        locality: undefinedWhenAbsent(courtBuilding.locality),
        subCode: undefinedWhenAbsent(courtBuilding.subCode),
      },
    })
  }

  async updateCourtBuildingContacts(
    context: Context,
    courtId: string,
    buildingId: string,
    contacts: NewOrExistingContact[]
  ): Promise<void> {
    logger.info(`Amending contacts for court ${courtId} building for ${buildingId}`)
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    const building = await CourtRegisterService.restClient(token).get<CourtBuilding>({
      path: `/courts/id/${courtId}/buildings/id/${buildingId}`,
    })

    const same = (updatedContact: NewOrExistingContact, originalContact: CourtBuildingContact) =>
      originalContact.id.toString() === updatedContact.id

    const hasChanged = (updatedContact: NewOrExistingContact) => {
      const originalContact = building.contacts?.find(contact => same(updatedContact, contact))
      return (
        originalContact &&
        (originalContact.type !== updatedContact.type || originalContact.detail !== updatedContact.detail)
      )
    }

    const noLongerPresent = (originalContact: CourtBuildingContact) => {
      return !contacts.find(contact => same(contact, originalContact))
    }

    // update ones that have changed
    await Promise.all(
      contacts
        .filter(contact => contact.id)
        .filter(hasChanged)
        .map(contact => {
          return CourtRegisterService.restClient(token).put({
            path: `/court-maintenance/id/${courtId}/buildings/${buildingId}/contacts/${contact.id}`,
            data: { type: contact.type, detail: contact.detail },
          })
        })
    )

    // insert new ones
    await Promise.all(
      contacts
        .filter(contact => !contact.id)
        .map(contact => {
          return CourtRegisterService.restClient(token).post({
            path: `/court-maintenance/id/${courtId}/buildings/${buildingId}/contacts`,
            data: { type: contact.type, detail: contact.detail },
          })
        })
    )

    // delete old ones
    await Promise.all(
      building.contacts?.filter(noLongerPresent).map(contact => {
        return CourtRegisterService.restClient(token).delete({
          path: `/court-maintenance/id/${courtId}/buildings/${buildingId}/contacts/${contact.id}`,
          data: contact,
        })
      }) || []
    )
  }

  async addCourt(context: Context, addCourt: AddCourt): Promise<AddUpdateResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Creating court ${addCourt.court.courtId}`)
    const courtOrError = await CourtRegisterService.restClient(token).post<Court & ServerError>({
      path: `/court-maintenance`,
      data: addCourt.court,
      additionalStatusChecker: status => status === 400,
    })
    if (courtOrError.error) {
      logger.error(`failed to create court ${addCourt.court.courtId}`)
      return {
        success: false,
        errorMessage: courtOrError.message,
      }
    }
    logger.info(`court ${courtOrError.courtId} created`)
    const createdBuilding = await CourtRegisterService.restClient(token).post<CourtBuilding>({
      path: `/court-maintenance/id/${courtOrError.courtId}/buildings`,
      data: addCourt.building,
    })

    logger.info(`court building ${createdBuilding.id} created`)
    const createdContacts = await Promise.all(
      addCourt.contacts.map(contact => {
        return CourtRegisterService.restClient(token).post<CourtBuildingContact>({
          path: `/court-maintenance/id/${courtOrError.courtId}/buildings/${createdBuilding.id}/contacts`,
          data: contact,
        })
      })
    )

    createdContacts.forEach(createdContact => {
      logger.info(`court building contact ${createdContact.id} created`)
    })

    return { success: true }
  }

  async getCourtTypes(context: Context): Promise<Array<CourtType>> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all court types`)
    return CourtRegisterService.restClient(token).get<CourtType[]>({ path: `/courts/types` })
  }

  async getCourtBuilding(context: Context, courtId: string, buildingId: string): Promise<CourtBuilding> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for court ${courtId} building ${buildingId}`)
    return CourtRegisterService.restClient(token).get<CourtBuilding>({
      path: `/courts/id/${courtId}/buildings/id/${buildingId}`,
    })
  }

  async addCourtBuilding(context: Context, courtId: string, newBuilding: InsertCourtBuilding): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding a building for court ${courtId} building ${newBuilding.buildingName}`)
    await CourtRegisterService.restClient(token).post({
      path: `/court-maintenance/id/${courtId}/buildings`,
      data: {
        ...newBuilding,
        locality: undefinedWhenAbsent(newBuilding.locality),
        subCode: undefinedWhenAbsent(newBuilding.subCode),
      },
    })
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
