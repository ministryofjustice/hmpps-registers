import querystring from 'querystring'
import HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../logger'
import {
  AgencyEmailAddress,
  ApprovedPremises,
  Court,
  EmailAddress,
  Hospital,
  InsertPrison,
  OtherAgency,
  PoliceCustodySuite,
  Prison,
  PrisonAddress,
  ProbationOffice,
  UpdatePrison,
  UpdatePrisonAddress,
  UpdateWelshPrisonAddress,
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

  async addCourtEmailAddress(
    context: Context,
    courtId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyEmailAddress> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding email address to court with id ${courtId}`)
    return PrisonRegisterService.restClient(token).post<AgencyEmailAddress>({
      path: `/courts/id/${courtId}/email-address`,
      data: emailAddress,
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
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
