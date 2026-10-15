import querystring from 'querystring'
import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import {
  AgencyAddress,
  AgencyEmailAddress,
  AgencyPhoneNumber,
  ApprovedPremises,
  Court,
  EmailAddress,
  Hospital,
  InsertPrison,
  OtherAgency,
  PoliceCustodySuite,
  PhoneNumber,
  Prison,
  PrisonAddress,
  ProbationOffice,
  UpdateCourt,
  UpdateEmailAddress,
  UpdatePrison,
  UpdatePrisonAddress,
  UpdateWelshPrisonAddress,
  CodeDescription,
} from '../@types/prisonRegister'
import { AllPrisonsFilter } from '../routes/prisonRegister/prisonMapper'
import { CourtsFilter } from '../routes/courtRegister/courtMapper'
import { OtherAgencyFilter } from '../routes/otherAgencyRegister/otherAgencyMapper'
import { HospitalFilter } from '../routes/hospitalRegister/hospitalMapper'
import { ProbationOfficeFilter } from '../routes/probationOfficeRegister/probationOfficeMapper'
import { PoliceCustodySuiteFilter } from '../routes/policeCustodySuiteRegister/policeCustodySuiteMapper'
import { ApprovedPremisesFilter } from '../routes/approvedPremisesRegister/approvedPremisesMapper'

export interface Context {
  username?: string
}

export interface AddUpdateResponse {
  success: boolean
  errorMessage?: string
}

export type CourtMutationResponse = { success: true } | { success: false; userMessage: string }

type ServerError = { status: number; error: string; message: string }

export default class PrisonRegisterService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('Prison Register Api Client', config.apis.prisonRegister, token)
  }

  private static async courtMutation(request: () => Promise<unknown>): Promise<CourtMutationResponse> {
    try {
      await request()
      return { success: true }
    } catch (error) {
      if (
        error instanceof Error &&
        'status' in error &&
        error.status === 400 &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'userMessage' in error.data &&
        typeof error.data.userMessage === 'string' &&
        error.data.userMessage.trim().length > 0
      ) {
        return { success: false, userMessage: error.data.userMessage }
      }
      throw error
    }
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
      categories: prison.categories,
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
    const { prisonName, male, female, contracted, lthse, categories } = prison
    const updatedPrison: UpdatePrison = { active, prisonName, male, female, contracted, lthse, prisonTypes, categories }
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Updating Prison ${prisonId} with active=${active}`)
    await PrisonRegisterService.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}`,
      data: updatedPrison,
    })
  }

  async getCourts(context: Context, filter: CourtsFilter): Promise<Court[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all courts with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<Court[]>({
      path: `/courts`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting court with id ${courtId}`)
    return PrisonRegisterService.restClient(token).get<Court>({
      path: `/courts/id/${courtId}`,
    })
  }

  async updateCourtDetails(context: Context, courtId: string, court: UpdateCourt): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating details for court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).put<Court>({
        path: `/courts/id/${courtId}`,
        data: court,
      }),
    )
  }

  async addCourtAddress(
    context: Context,
    courtId: string,
    address: UpdatePrisonAddress,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding address to court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).post<AgencyAddress>({
        path: `/courts/id/${courtId}/address`,
        data: {
          ...address,
          addressLine1: undefinedWhenAbsent(address.addressLine1),
          addressLine2: undefinedWhenAbsent(address.addressLine2),
          county: undefinedWhenAbsent(address.county),
        },
      }),
    )
  }

  async updateCourtAddress(
    context: Context,
    courtId: string,
    addressId: number,
    address: UpdatePrisonAddress,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating address for court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).put<AgencyAddress>({
        path: `/courts/id/${courtId}/address/${addressId}`,
        data: {
          ...address,
          addressLine1: undefinedWhenAbsent(address.addressLine1),
          addressLine2: undefinedWhenAbsent(address.addressLine2),
          county: undefinedWhenAbsent(address.county),
        },
      }),
    )
  }

  async addCourtPhoneNumber(
    context: Context,
    courtId: string,
    phoneNumber: PhoneNumber,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding phone number to court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).post<AgencyPhoneNumber>({
        path: `/courts/id/${courtId}/phone-number`,
        data: phoneNumber,
      }),
    )
  }

  async addCourtEmailAddress(
    context: Context,
    courtId: string,
    emailAddress: EmailAddress,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding email address to court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).post<AgencyEmailAddress>({
        path: `/courts/id/${courtId}/email-address`,
        data: emailAddress,
      }),
    )
  }

  async updateCourtPhoneNumber(
    context: Context,
    courtId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating phone number for court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).put<AgencyPhoneNumber>({
        path: `/courts/id/${courtId}/phone-number/${phoneId}`,
        data: phoneNumber,
      }),
    )
  }

  async updateCourtEmailAddress(
    context: Context,
    courtId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<CourtMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating email address for court with id ${courtId}`)
    return PrisonRegisterService.courtMutation(() =>
      PrisonRegisterService.restClient(token).put<AgencyEmailAddress>({
        path: `/courts/id/${courtId}/email-address/${emailId}`,
        data: emailAddress,
      }),
    )
  }

  async deleteCourtPhoneNumber(context: Context, courtId: string, phoneId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting phone number for court with id ${courtId}`)
    await PrisonRegisterService.restClient(token).delete({
      path: `/courts/id/${courtId}/phone-number/${phoneId}`,
    })
  }

  async deleteCourtEmailAddress(context: Context, courtId: string, emailId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting email address for court with id ${courtId}`)
    await PrisonRegisterService.restClient(token).delete({
      path: `/courts/id/${courtId}/email-address/${emailId}`,
    })
  }

  async getOtherAgencies(context: Context, filter: OtherAgencyFilter): Promise<OtherAgency[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all other agencies with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<OtherAgency[]>({
      path: `/other-agencies`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getOtherAgency(context: Context, agencyId: string): Promise<OtherAgency> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting other agency with id ${agencyId}`)
    return PrisonRegisterService.restClient(token).get<OtherAgency>({
      path: `/other-agencies/id/${agencyId}`,
    })
  }

  async getHospitals(context: Context, filter: HospitalFilter): Promise<Hospital[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all hospitals with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<Hospital[]>({
      path: `/hospitals`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getHospital(context: Context, hospitalId: string): Promise<Hospital> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting hospital with id ${hospitalId}`)
    return PrisonRegisterService.restClient(token).get<Hospital>({
      path: `/hospitals/id/${hospitalId}`,
    })
  }

  async getProbationOffices(context: Context, filter: ProbationOfficeFilter): Promise<ProbationOffice[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all probation offices with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<ProbationOffice[]>({
      path: `/probation-offices`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getProbationOffice(context: Context, probationOfficeId: string): Promise<ProbationOffice> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting probation office with id ${probationOfficeId}`)
    return PrisonRegisterService.restClient(token).get<ProbationOffice>({
      path: `/probation-offices/id/${probationOfficeId}`,
    })
  }

  async getPoliceCustodySuites(context: Context, filter: PoliceCustodySuiteFilter): Promise<PoliceCustodySuite[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all police custody suites with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<PoliceCustodySuite[]>({
      path: `/police-custody-suites`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getPoliceCustodySuite(context: Context, policeCustodySuiteId: string): Promise<PoliceCustodySuite> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting police custody suite with id ${policeCustodySuiteId}`)
    return PrisonRegisterService.restClient(token).get<PoliceCustodySuite>({
      path: `/police-custody-suites/id/${policeCustodySuiteId}`,
    })
  }

  async getAllApprovedPremises(context: Context, filter: ApprovedPremisesFilter): Promise<ApprovedPremises[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all approved premises with filter ${JSON.stringify(filter)}`)
    return PrisonRegisterService.restClient(token).get<ApprovedPremises[]>({
      path: `/approved-premises`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getApprovedPremises(context: Context, approvedPremisesId: string): Promise<ApprovedPremises> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting approved premises with id ${approvedPremisesId}`)
    return PrisonRegisterService.restClient(token).get<ApprovedPremises>({
      path: `/approved-premises/id/${approvedPremisesId}`,
    })
  }

  async getTownSuggestions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting town suggestions`)
    return PrisonRegisterService.restClient(token).get<CodeDescription[]>({
      path: `/reference-data/suggestions/towns`,
    })
  }

  async getAreas(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    return PrisonRegisterService.restClient(token).get<CodeDescription[]>({
      path: '/reference-data/areas',
    })
  }

  async getCountySuggestions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting county suggestions`)
    return PrisonRegisterService.restClient(token).get<CodeDescription[]>({
      path: `/reference-data/suggestions/counties`,
    })
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
