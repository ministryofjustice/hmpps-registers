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

  async getPageOfCourts(
    context: Context,
    pageNumber: number,
    pageSize: number,
    filter: AllCourtsFilter
  ): Promise<CourtsPage> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for page of courts with filter ${filter}`)
    return (await CourtRegisterService.restClient(token).get({
      path: `/courts/paged`,
      query: `page=${pageNumber}&size=${pageSize}&sort=courtName&${querystring.stringify(filter)}`,
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

  async findCourtBuilding(context: Context, subCode: string): Promise<CourtBuilding> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for court building ${subCode}`)
    return (await CourtRegisterService.restClient(token).get({
      path: `/courts/buildings/sub-code/${subCode}`,
      additionalStatusChecker: status => status === 404,
    })) as CourtBuilding
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
      courtDescription: nullWhenAbsent(courtDescription),
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
        locality: nullWhenAbsent(courtBuilding.locality),
        subCode: nullWhenAbsent(courtBuilding.subCode),
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
    const building = (await CourtRegisterService.restClient(token).get({
      path: `/courts/id/${courtId}/buildings/id/${buildingId}`,
    })) as CourtBuilding

    const same = (updatedContact: NewOrExistingContact, originalContact: CourtBuildingContact) =>
      originalContact.id.toString() === updatedContact.id

    const hasChanged = (updatedContact: NewOrExistingContact) => {
      const originalContact = building.contacts.find(contact => same(updatedContact, contact))
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
      building.contacts.filter(noLongerPresent).map(contact => {
        return CourtRegisterService.restClient(token).delete({
          path: `/court-maintenance/id/${courtId}/buildings/${buildingId}/contacts/${contact.id}`,
          data: contact,
        })
      })
    )
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

  async getCourtBuilding(context: Context, courtId: string, buildingId: string): Promise<CourtBuilding> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for court ${courtId} building ${buildingId}`)
    return (await CourtRegisterService.restClient(token).get({
      path: `/courts/id/${courtId}/buildings/id/${buildingId}`,
    })) as CourtBuilding
  }

  async addCourtBuilding(context: Context, courtId: string, newBuilding: InsertCourtBuilding): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding a building for court ${courtId} building ${newBuilding.buildingName}`)
    await CourtRegisterService.restClient(token).post({
      path: `/court-maintenance/id/${courtId}/buildings`,
      data: newBuilding,
    })
  }
}

function nullWhenAbsent(value: string): string | null {
  return (value && value.trim().length > 0 && value) || null
}

type NewOrExistingContact = UpdateCourtBuildingContact & { id?: string }
