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
  LegacyAgencyUsage,
  OtherAgency,
  PoliceCustodySuite,
  PhoneNumber,
  Prison,
  PrisonAddress,
  ProbationOffice,
  UpdateCourt,
  CreateHospital,
  UpdateHospital,
  CreateCourt,
  UpdateEmailAddress,
  UpdatePrison,
  UpdatePrisonAddress,
  UpdateAgencyAddress,
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

export type AgencyMutationResponse = { success: true } | { success: false; userMessage: string }

type ServerError = { status: number; error: string; message: string }

export default class HMPPSAgencyRegisterApi {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Agency Register API Client', config.apis.prisonRegister, token)
  }

  private static async agencyMutation(request: () => Promise<unknown>): Promise<AgencyMutationResponse> {
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
    return HMPPSAgencyRegisterApi.restClient(token).get<Prison[]>({
      path: `/prisons/search`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getPrison(context: Context, prisonId: string): Promise<Prison> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prison ${prisonId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Prison>({ path: `/prisons/id/${prisonId}` })
  }

  async findPrison(context: Context, prisonId: string): Promise<Prison | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding details for prison ${prisonId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Prison | undefined>({
      path: `/prisons/id/${prisonId}`,
      additionalStatusChecker: status => status === 404,
    })
  }

  async isAgencyIdUsed(context: Context, agencyId: string): Promise<LegacyAgencyUsage | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`checking whether agency id ${agencyId} is in use`)
    const response = await HMPPSAgencyRegisterApi.restClient(token).get<{
      status: number
      body: LegacyAgencyUsage
    }>({
      path: `/legacy/agency/${encodeURIComponent(agencyId)}/is-used`,
      raw: true,
    })
    return response.status === 204 ? undefined : response.body
  }

  async getPrisonAddress(context: Context, prisonId: string, addressId: string): Promise<PrisonAddress> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting details for prisonId ${prisonId} address ${addressId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<PrisonAddress>({
      path: `/prisons/id/${prisonId}/address/${addressId}`,
    })
  }

  async addPrison(context: Context, insertPrison: InsertPrison): Promise<AddUpdateResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Creating prison ${insertPrison.prisonId}`)
    const prisonOrError = await HMPPSAgencyRegisterApi.restClient(token).post<Prison & ServerError>({
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
    await HMPPSAgencyRegisterApi.restClient(token).put({
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
    await HMPPSAgencyRegisterApi.restClient(token).put({
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
    await HMPPSAgencyRegisterApi.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}/welsh-address/${addressId}`,
      data: welshAddress,
    })
  }

  async deletePrisonAddress(context: Context, prisonId: string, addressId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Deleting prison address for prison ${prisonId} and address ${addressId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/prison-maintenance/id/${prisonId}/address/${addressId}`,
    })
  }

  async addPrisonAddress(context: Context, prisonId: string, prisonAddress: UpdatePrisonAddress): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`Adding address to prison ${prisonId}`)
    await HMPPSAgencyRegisterApi.restClient(token).post({
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
    await HMPPSAgencyRegisterApi.restClient(token).put({
      path: `/prison-maintenance/id/${prisonId}`,
      data: updatedPrison,
    })
  }

  async getCourts(context: Context, filter: CourtsFilter): Promise<Court[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all courts with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Court[]>({
      path: `/courts`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Court>({
      path: `/courts/id/${courtId}`,
    })
  }

  async findCourt(context: Context, courtId: string): Promise<Court | undefined> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`finding court with id ${courtId}`)
    try {
      return await HMPPSAgencyRegisterApi.restClient(token).get<Court>({
        path: `/courts/id/${encodeURIComponent(courtId)}`,
      })
    } catch (error) {
      if (error instanceof Error && 'status' in error && error.status === 404) return undefined
      throw error
    }
  }

  async createCourt(context: Context, court: CreateCourt): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`creating court with id ${court.courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<Court>({ path: '/courts', data: court }),
    )
  }

  async updateCourtDetails(context: Context, courtId: string, court: UpdateCourt): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating details for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<Court>({
        path: `/courts/id/${courtId}`,
        data: court,
      }),
    )
  }

  async addCourtAddress(
    context: Context,
    courtId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding address to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<AgencyAddress>({
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
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating address for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<AgencyAddress>({
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
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding phone number to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<AgencyPhoneNumber>({
        path: `/courts/id/${courtId}/phone-number`,
        data: phoneNumber,
      }),
    )
  }

  async addCourtEmailAddress(
    context: Context,
    courtId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding email address to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<AgencyEmailAddress>({
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
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating phone number for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<AgencyPhoneNumber>({
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
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating email address for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<AgencyEmailAddress>({
        path: `/courts/id/${courtId}/email-address/${emailId}`,
        data: emailAddress,
      }),
    )
  }

  async deleteCourt(context: Context, courtId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting court with id ${courtId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/courts/id/${encodeURIComponent(courtId)}`,
    })
  }

  async deleteCourtAddress(context: Context, courtId: string, addressId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting address for court with id ${courtId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/courts/id/${encodeURIComponent(courtId)}/address/${addressId}`,
    })
  }

  async deleteCourtPhoneNumber(context: Context, courtId: string, phoneId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting phone number for court with id ${courtId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/courts/id/${courtId}/phone-number/${phoneId}`,
    })
  }

  async deleteCourtEmailAddress(context: Context, courtId: string, emailId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting email address for court with id ${courtId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/courts/id/${courtId}/email-address/${emailId}`,
    })
  }

  async getOtherAgencies(context: Context, filter: OtherAgencyFilter): Promise<OtherAgency[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all other agencies with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<OtherAgency[]>({
      path: `/other-agencies`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getOtherAgency(context: Context, agencyId: string): Promise<OtherAgency> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<OtherAgency>({
      path: `/other-agencies/id/${agencyId}`,
    })
  }

  async getHospitals(context: Context, filter: HospitalFilter): Promise<Hospital[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all hospitals with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Hospital[]>({
      path: `/hospitals`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getHospital(context: Context, hospitalId: string): Promise<Hospital> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<Hospital>({
      path: `/hospitals/id/${hospitalId}`,
    })
  }

  async createHospital(context: Context, hospital: CreateHospital): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`creating hospital with id ${hospital.hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<Hospital>({ path: '/hospitals', data: hospital }),
    )
  }

  async updateHospitalDetails(
    context: Context,
    hospitalId: string,
    hospital: UpdateHospital,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating details for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<Hospital>({
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}`,
        data: hospital,
      }),
    )
  }

  async addHospitalAddress(
    context: Context,
    hospitalId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding address to hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<AgencyAddress>({
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address`,
        data: HMPPSAgencyRegisterApi.agencyAddressData(address),
      }),
    )
  }

  async updateHospitalAddress(
    context: Context,
    hospitalId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating address for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<AgencyAddress>({
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address/${addressId}`,
        data: HMPPSAgencyRegisterApi.agencyAddressData(address),
      }),
    )
  }

  async addHospitalPhoneNumber(
    context: Context,
    hospitalId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`adding phone number to hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).post<AgencyPhoneNumber>({
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number`,
        data: phoneNumber,
      }),
    )
  }

  async updateHospitalPhoneNumber(
    context: Context,
    hospitalId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`updating phone number for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      HMPPSAgencyRegisterApi.restClient(token).put<AgencyPhoneNumber>({
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number/${phoneId}`,
        data: phoneNumber,
      }),
    )
  }

  async deleteHospital(context: Context, hospitalId: string): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting hospital with id ${hospitalId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/hospitals/id/${encodeURIComponent(hospitalId)}`,
    })
  }

  async deleteHospitalAddress(context: Context, hospitalId: string, addressId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting address for hospital with id ${hospitalId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address/${addressId}`,
    })
  }

  async deleteHospitalPhoneNumber(context: Context, hospitalId: string, phoneId: number): Promise<void> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`deleting phone number for hospital with id ${hospitalId}`)
    await HMPPSAgencyRegisterApi.restClient(token).delete({
      path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number/${phoneId}`,
    })
  }

  private static agencyAddressData(address: UpdateAgencyAddress): UpdateAgencyAddress {
    return {
      ...address,
      addressLine1: undefinedWhenAbsent(address.addressLine1),
      addressLine2: undefinedWhenAbsent(address.addressLine2),
      county: undefinedWhenAbsent(address.county),
    }
  }

  async getProbationOffices(context: Context, filter: ProbationOfficeFilter): Promise<ProbationOffice[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all probation offices with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<ProbationOffice[]>({
      path: `/probation-offices`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getProbationOffice(context: Context, probationOfficeId: string): Promise<ProbationOffice> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<ProbationOffice>({
      path: `/probation-offices/id/${probationOfficeId}`,
    })
  }

  async getPoliceCustodySuites(context: Context, filter: PoliceCustodySuiteFilter): Promise<PoliceCustodySuite[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all police custody suites with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<PoliceCustodySuite[]>({
      path: `/police-custody-suites`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getPoliceCustodySuite(context: Context, policeCustodySuiteId: string): Promise<PoliceCustodySuite> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<PoliceCustodySuite>({
      path: `/police-custody-suites/id/${policeCustodySuiteId}`,
    })
  }

  async getAllApprovedPremises(context: Context, filter: ApprovedPremisesFilter): Promise<ApprovedPremises[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting all approved premises with filter ${JSON.stringify(filter)}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<ApprovedPremises[]>({
      path: `/approved-premises`,
      query: `${querystring.stringify(filter)}`,
    })
  }

  async getApprovedPremises(context: Context, approvedPremisesId: string): Promise<ApprovedPremises> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.restClient(token).get<ApprovedPremises>({
      path: `/approved-premises/id/${approvedPremisesId}`,
    })
  }

  async getTownSuggestions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting town suggestions`)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: `/reference-data/suggestions/towns`,
    })
  }

  async getAreas(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: '/reference-data/areas',
    })
  }

  async getPayrollRegions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: '/reference-data/payroll-regions',
    })
  }

  async getLocalAuthorities(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: '/reference-data/local-authorities',
    })
  }

  async getRegions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: '/reference-data/regions',
    })
  }

  async getCountySuggestions(context: Context): Promise<CodeDescription[]> {
    const token = await this.hmppsAuthClient.getApiClientToken(context.username)
    logger.info(`getting county suggestions`)
    return HMPPSAgencyRegisterApi.restClient(token).get<CodeDescription[]>({
      path: `/reference-data/suggestions/counties`,
    })
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
