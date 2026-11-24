import querystring from 'querystring'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asSystem, RestClient, type SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'
import {
  AgencyAddress,
  AgencyEmailAddress,
  AgencyPhoneNumber,
  ApprovedPremises,
  Court,
  CourtSummary,
  ContactDetails,
  DepartmentType,
  EmailAddress,
  Hospital,
  InsertPrison,
  LegacyAgencyUsage,
  OtherAgency,
  CreateOtherAgency,
  UpdateOtherAgency,
  PoliceCustodySuite,
  PhoneNumber,
  Prison,
  PrisonAddress,
  ProbationOffice,
  UpdateCourt,
  CreateHospital,
  UpdateHospital,
  UpdateApprovedPremises,
  CreateApprovedPremises,
  CreatePoliceCustodySuite,
  UpdatePoliceCustodySuite,
  CreateProbationOffice,
  UpdateProbationOffice,
  CreateCourt,
  UpdateEmailAddress,
  UpdatePrison,
  UpdatePrisonArea,
  UpdatePrisonAddress,
  UpdateAgencyAddress,
  UpdateWelshPrisonAddress,
  CodeDescription,
  PrisonDetails,
  PrisonOperator,
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
  private readonly restClient: RestClient

  constructor(hmppsAuthClient: AuthenticationClient) {
    this.restClient = new RestClient(
      'HMPPS Agency Register API Client',
      config.apis.prisonRegister,
      logger,
      hmppsAuthClient,
    )
  }

  private static async agencyMutation(request: () => Promise<unknown>): Promise<AgencyMutationResponse> {
    try {
      await request()
      return { success: true }
    } catch (error) {
      if (
        error instanceof Error &&
        'responseStatus' in error &&
        error.responseStatus === 400 &&
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
    logger.info(`getting details for prisons with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<Prison[]>(
      {
        path: `/prisons/search`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getPrison(context: Context, prisonId: string): Promise<Prison> {
    logger.info(`getting details for prison ${prisonId}`)
    // Read from the maintenance endpoint, not /prisons/id: the API caches /prisons/id, and the
    // updates below send back every field, so a cached copy could undo a recent change
    return this.restClient.get<Prison>(
      { path: `/prison-maintenance/id/${prisonId}/details` },
      asSystem(context.username),
    )
  }

  async getPrisonDetails(context: Context, prisonId: string): Promise<PrisonDetails> {
    logger.info(`getting full details for prison ${prisonId}`)
    return this.restClient.get<PrisonDetails>(
      {
        path: `/prison-maintenance/id/${prisonId}/details`,
      },
      asSystem(context.username),
    )
  }

  async findPrison(context: Context, prisonId: string): Promise<Prison | undefined> {
    logger.info(`finding details for prison ${prisonId}`)
    return this.restClient.get<Prison | undefined>(
      {
        path: `/prisons/id/${prisonId}`,
        errorHandler: (_path, _method, error) => {
          if (error.responseStatus === 404) return undefined
          throw error
        },
      },
      asSystem(context.username),
    )
  }

  async isAgencyIdUsed(context: Context, agencyId: string): Promise<LegacyAgencyUsage | undefined> {
    logger.info(`checking whether agency id ${agencyId} is in use`)
    const response = await this.restClient.get<{
      status: number
      body: LegacyAgencyUsage
    }>(
      {
        path: `/legacy/agency/${encodeURIComponent(agencyId)}/is-used`,
        raw: true,
      },
      asSystem(context.username),
    )
    return response.status === 204 ? undefined : response.body
  }

  async getPrisonAddress(context: Context, prisonId: string, addressId: string): Promise<PrisonAddress> {
    logger.info(`getting details for prisonId ${prisonId} address ${addressId}`)
    return this.restClient.get<PrisonAddress>(
      {
        path: `/prisons/id/${prisonId}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async addPrison(context: Context, insertPrison: InsertPrison): Promise<AddUpdateResponse> {
    logger.info(`Creating prison ${insertPrison.prisonId}`)
    const prisonOrError = await this.restClient.post<Prison & ServerError>(
      {
        path: `/prison-maintenance`,
        data: insertPrison,
        // a 400 carries a message to show the user
        errorHandler: (_path, _method, error: SanitisedError<Prison & ServerError>) => {
          if (error.responseStatus === 400) return error.data
          throw error
        },
      },
      asSystem(context.username),
    )
    if (prisonOrError.error) {
      logger.error(`failed to create prison ${insertPrison.prisonId}`)
      return {
        success: false,
        errorMessage: prisonOrError.message,
      }
    }
    return { success: true }
  }

  async updatePrisonDetails(context: Context, prisonId: string, prison: UpdatePrison): Promise<AgencyMutationResponse> {
    logger.info(`Amending prison details for ${prisonId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put(
        {
          path: `/prison-maintenance/id/${prisonId}`,
          data: prison,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePrisonArea(context: Context, prisonId: string, area: UpdatePrisonArea): Promise<AgencyMutationResponse> {
    logger.info(`updating area details for prison ${prisonId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put(
        {
          path: `/prison-maintenance/id/${prisonId}/area`,
          data: area,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePrisonAddress(
    context: Context,
    prisonId: string,
    addressId: string,
    prisonAddress: UpdatePrisonAddress,
  ): Promise<void> {
    logger.info(`Amending prison ${prisonId} address for ${addressId}`)
    await this.restClient.put(
      {
        path: `/prison-maintenance/id/${prisonId}/address/${addressId}`,
        data: {
          ...prisonAddress,
          addressLine1: undefinedWhenAbsent(prisonAddress.addressLine1),
          addressLine2: undefinedWhenAbsent(prisonAddress.addressLine2),
          county: undefinedWhenAbsent(prisonAddress.county),
        },
      },
      asSystem(context.username),
    )
  }

  async updateAddressWithWelshPrisonAddress(
    context: Context,
    prisonId: string,
    addressId: string,
    welshAddress: UpdateWelshPrisonAddress,
  ): Promise<void> {
    logger.info(`Amending Welsh prison ${prisonId} address for ${addressId}`)
    await this.restClient.put(
      {
        path: `/prison-maintenance/id/${prisonId}/welsh-address/${addressId}`,
        data: welshAddress,
      },
      asSystem(context.username),
    )
  }

  async createPrisonContactDetails(
    context: Context,
    prisonId: string,
    contactDetails: ContactDetails,
  ): Promise<AgencyMutationResponse> {
    logger.info(`Adding ${contactDetails.type} contact details to prison ${prisonId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<ContactDetails>(
        {
          path: `/secure/prisons/id/${prisonId}/department/contact-details`,
          data: contactDetails,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePrisonContactDetails(
    context: Context,
    prisonId: string,
    contactDetails: ContactDetails,
  ): Promise<AgencyMutationResponse> {
    logger.info(`Updating ${contactDetails.type} contact details for prison ${prisonId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<ContactDetails>(
        {
          path: `/secure/prisons/id/${prisonId}/department/contact-details`,
          query: { removeIfNull: true },
          data: contactDetails,
        },
        asSystem(context.username),
      ),
    )
  }

  async deletePrisonContactDetails(context: Context, prisonId: string, departmentType: DepartmentType): Promise<void> {
    logger.info(`Deleting ${departmentType} contact details for prison ${prisonId}`)
    await this.restClient.delete(
      {
        path: `/secure/prisons/id/${prisonId}/department/contact-details`,
        query: { departmentType },
      },
      asSystem(context.username),
    )
  }

  async deletePrisonAddress(context: Context, prisonId: string, addressId: string): Promise<void> {
    logger.info(`Deleting prison address for prison ${prisonId} and address ${addressId}`)
    await this.restClient.delete(
      {
        path: `/prison-maintenance/id/${prisonId}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async addPrisonAddress(context: Context, prisonId: string, prisonAddress: UpdatePrisonAddress): Promise<void> {
    logger.info(`Adding address to prison ${prisonId}`)
    await this.restClient.post(
      {
        path: `/prison-maintenance/id/${prisonId}/address`,
        data: {
          ...prisonAddress,
          addressLine1: undefinedWhenAbsent(prisonAddress.addressLine1),
          addressLine2: undefinedWhenAbsent(prisonAddress.addressLine2),
          county: undefinedWhenAbsent(prisonAddress.county),
        },
      },
      asSystem(context.username),
    )
  }

  async updateActivePrisonMarker(context: Context, prisonId: string, active: boolean): Promise<void> {
    const prison: Prison = await this.getPrison(context, prisonId)
    const prisonTypes = prison.types.map(type => type.code)
    const {
      prisonName,
      prisonDescription,
      prisonNameInWelsh,
      male,
      female,
      contracted,
      lthse,
      categories,
      currentOperator,
    } = prison
    // The API replaces every field it is sent, so anything left out here is cleared on the prison
    const updatedPrison: UpdatePrison = {
      active,
      prisonName,
      prisonDescription,
      prisonNameInWelsh,
      male,
      female,
      contracted,
      lthse,
      prisonTypes,
      categories,
      operator: currentOperator,
    }
    logger.info(`Updating Prison ${prisonId} with active=${active}`)
    await this.restClient.put(
      {
        path: `/prison-maintenance/id/${prisonId}`,
        data: updatedPrison,
      },
      asSystem(context.username),
    )
  }

  async getCourts(context: Context, filter: CourtsFilter): Promise<Court[]> {
    logger.info(`getting all courts with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<Court[]>(
      {
        path: `/courts`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getCourtSummaries(context: Context, filter: CourtsFilter): Promise<CourtSummary[]> {
    logger.info(`getting court summaries with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<CourtSummary[]>(
      {
        path: `/courts/summary`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getCourt(context: Context, courtId: string): Promise<Court> {
    logger.info(`getting court with id ${courtId}`)
    return this.restClient.get<Court>(
      {
        path: `/courts/id/${courtId}`,
      },
      asSystem(context.username),
    )
  }

  async findCourt(context: Context, courtId: string): Promise<Court | undefined> {
    logger.info(`finding court with id ${courtId}`)
    try {
      return await this.restClient.get<Court>(
        {
          path: `/courts/id/${encodeURIComponent(courtId)}`,
        },
        asSystem(context.username),
      )
    } catch (error) {
      if (error instanceof Error && 'responseStatus' in error && error.responseStatus === 404) return undefined
      throw error
    }
  }

  async createCourt(context: Context, court: CreateCourt): Promise<AgencyMutationResponse> {
    logger.info(`creating court with id ${court.courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<Court>({ path: '/courts', data: court }, asSystem(context.username)),
    )
  }

  async updateCourtDetails(context: Context, courtId: string, court: UpdateCourt): Promise<AgencyMutationResponse> {
    logger.info(`updating details for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<Court>(
        {
          path: `/courts/id/${courtId}`,
          data: court,
        },
        asSystem(context.username),
      ),
    )
  }

  async addCourtAddress(
    context: Context,
    courtId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/courts/id/${courtId}/address`,
          data: {
            ...address,
            addressLine1: undefinedWhenAbsent(address.addressLine1),
            addressLine2: undefinedWhenAbsent(address.addressLine2),
            county: undefinedWhenAbsent(address.county),
          },
        },
        asSystem(context.username),
      ),
    )
  }

  async updateCourtAddress(
    context: Context,
    courtId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/courts/id/${courtId}/address/${addressId}`,
          data: {
            ...address,
            addressLine1: undefinedWhenAbsent(address.addressLine1),
            addressLine2: undefinedWhenAbsent(address.addressLine2),
            county: undefinedWhenAbsent(address.county),
          },
        },
        asSystem(context.username),
      ),
    )
  }

  async addCourtPhoneNumber(
    context: Context,
    courtId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/courts/id/${courtId}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async addCourtEmailAddress(
    context: Context,
    courtId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding email address to court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyEmailAddress>(
        {
          path: `/courts/id/${courtId}/email-address`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateCourtPhoneNumber(
    context: Context,
    courtId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/courts/id/${courtId}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateCourtEmailAddress(
    context: Context,
    courtId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating email address for court with id ${courtId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyEmailAddress>(
        {
          path: `/courts/id/${courtId}/email-address/${emailId}`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async deleteCourt(context: Context, courtId: string): Promise<void> {
    logger.info(`deleting court with id ${courtId}`)
    await this.restClient.delete(
      {
        path: `/courts/id/${encodeURIComponent(courtId)}`,
      },
      asSystem(context.username),
    )
  }

  async deleteCourtAddress(context: Context, courtId: string, addressId: number): Promise<void> {
    logger.info(`deleting address for court with id ${courtId}`)
    await this.restClient.delete(
      {
        path: `/courts/id/${encodeURIComponent(courtId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteCourtPhoneNumber(context: Context, courtId: string, phoneId: number): Promise<void> {
    logger.info(`deleting phone number for court with id ${courtId}`)
    await this.restClient.delete(
      {
        path: `/courts/id/${courtId}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteCourtEmailAddress(context: Context, courtId: string, emailId: number): Promise<void> {
    logger.info(`deleting email address for court with id ${courtId}`)
    await this.restClient.delete(
      {
        path: `/courts/id/${courtId}/email-address/${emailId}`,
      },
      asSystem(context.username),
    )
  }

  async getOtherAgencies(context: Context, filter: OtherAgencyFilter): Promise<OtherAgency[]> {
    logger.info(`getting all other agencies with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<OtherAgency[]>(
      {
        path: `/other-agencies`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getOtherAgency(context: Context, agencyId: string): Promise<OtherAgency> {
    logger.info(`getting other agency with id ${agencyId}`)
    return this.restClient.get<OtherAgency>(
      {
        path: `/other-agencies/id/${agencyId}`,
      },
      asSystem(context.username),
    )
  }

  async updateOtherAgencyDetails(
    context: Context,
    agencyId: string,
    otherAgency: UpdateOtherAgency,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating details for other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<OtherAgency>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}`,
          data: otherAgency,
        },
        asSystem(context.username),
      ),
    )
  }

  async addOtherAgencyAddress(
    context: Context,
    agencyId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/address`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async updateOtherAgencyAddress(
    context: Context,
    agencyId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/address/${addressId}`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async addOtherAgencyPhoneNumber(
    context: Context,
    agencyId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateOtherAgencyPhoneNumber(
    context: Context,
    agencyId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async addOtherAgencyEmailAddress(
    context: Context,
    agencyId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding email address to other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyEmailAddress>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/email-address`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateOtherAgencyEmailAddress(
    context: Context,
    agencyId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating email address for other agency with id ${agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyEmailAddress>(
        {
          path: `/other-agencies/id/${encodeURIComponent(agencyId)}/email-address/${emailId}`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async createOtherAgency(context: Context, otherAgency: CreateOtherAgency): Promise<AgencyMutationResponse> {
    logger.info(`creating other agency with id ${otherAgency.agencyId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<OtherAgency>(
        {
          path: '/other-agencies',
          data: otherAgency,
        },
        asSystem(context.username),
      ),
    )
  }

  async deleteProbationOffice(context: Context, id: string): Promise<void> {
    logger.info(`deleting probation office with id ${id}`)
    await this.restClient.delete(
      {
        path: `/probation-offices/id/${encodeURIComponent(id)}`,
      },
      asSystem(context.username),
    )
  }

  async deleteProbationOfficeAddress(context: Context, probationOfficeId: string, addressId: number): Promise<void> {
    logger.info(`deleting address for probation office with id ${probationOfficeId}`)
    await this.restClient.delete(
      {
        path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteProbationOfficePhoneNumber(context: Context, probationOfficeId: string, phoneId: number): Promise<void> {
    logger.info(`deleting phone number for probation office with id ${probationOfficeId}`)
    await this.restClient.delete(
      {
        path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteProbationOfficeEmailAddress(context: Context, probationOfficeId: string, emailId: number): Promise<void> {
    logger.info(`deleting email address for probation office with id ${probationOfficeId}`)
    await this.restClient.delete(
      {
        path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/email-address/${emailId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteApprovedPremises(context: Context, id: string): Promise<void> {
    logger.info(`deleting approved premises with id ${id}`)
    await this.restClient.delete(
      {
        path: `/approved-premises/id/${encodeURIComponent(id)}`,
      },
      asSystem(context.username),
    )
  }

  async deleteApprovedPremisesAddress(context: Context, approvedPremisesId: string, addressId: number): Promise<void> {
    logger.info(`deleting address for approved premises with id ${approvedPremisesId}`)
    await this.restClient.delete(
      {
        path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteApprovedPremisesPhoneNumber(
    context: Context,
    approvedPremisesId: string,
    phoneId: number,
  ): Promise<void> {
    logger.info(`deleting phone number for approved premises with id ${approvedPremisesId}`)
    await this.restClient.delete(
      {
        path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteApprovedPremisesEmailAddress(
    context: Context,
    approvedPremisesId: string,
    emailId: number,
  ): Promise<void> {
    logger.info(`deleting email address for approved premises with id ${approvedPremisesId}`)
    await this.restClient.delete(
      {
        path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/email-address/${emailId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteOtherAgency(context: Context, id: string): Promise<void> {
    logger.info(`deleting other agency with id ${id}`)
    await this.restClient.delete(
      {
        path: `/other-agencies/id/${encodeURIComponent(id)}`,
      },
      asSystem(context.username),
    )
  }

  async deleteOtherAgencyAddress(context: Context, agencyId: string, addressId: number): Promise<void> {
    logger.info(`deleting address for other agency with id ${agencyId}`)
    await this.restClient.delete(
      {
        path: `/other-agencies/id/${encodeURIComponent(agencyId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteOtherAgencyPhoneNumber(context: Context, agencyId: string, phoneId: number): Promise<void> {
    logger.info(`deleting phone number for other agency with id ${agencyId}`)
    await this.restClient.delete(
      {
        path: `/other-agencies/id/${encodeURIComponent(agencyId)}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteOtherAgencyEmailAddress(context: Context, agencyId: string, emailId: number): Promise<void> {
    logger.info(`deleting email address for other agency with id ${agencyId}`)
    await this.restClient.delete(
      {
        path: `/other-agencies/id/${encodeURIComponent(agencyId)}/email-address/${emailId}`,
      },
      asSystem(context.username),
    )
  }

  async getHospitals(context: Context, filter: HospitalFilter): Promise<Hospital[]> {
    logger.info(`getting all hospitals with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<Hospital[]>(
      {
        path: `/hospitals`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getHospital(context: Context, hospitalId: string): Promise<Hospital> {
    logger.info(`getting hospital with id ${hospitalId}`)
    return this.restClient.get<Hospital>(
      {
        path: `/hospitals/id/${hospitalId}`,
      },
      asSystem(context.username),
    )
  }

  async createHospital(context: Context, hospital: CreateHospital): Promise<AgencyMutationResponse> {
    logger.info(`creating hospital with id ${hospital.hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<Hospital>({ path: '/hospitals', data: hospital }, asSystem(context.username)),
    )
  }

  async updateHospitalDetails(
    context: Context,
    hospitalId: string,
    hospital: UpdateHospital,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating details for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<Hospital>(
        {
          path: `/hospitals/id/${encodeURIComponent(hospitalId)}`,
          data: hospital,
        },
        asSystem(context.username),
      ),
    )
  }

  async addHospitalAddress(
    context: Context,
    hospitalId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async updateHospitalAddress(
    context: Context,
    hospitalId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address/${addressId}`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async addHospitalPhoneNumber(
    context: Context,
    hospitalId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateHospitalPhoneNumber(
    context: Context,
    hospitalId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for hospital with id ${hospitalId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async deleteHospital(context: Context, hospitalId: string): Promise<void> {
    logger.info(`deleting hospital with id ${hospitalId}`)
    await this.restClient.delete(
      {
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}`,
      },
      asSystem(context.username),
    )
  }

  async deleteHospitalAddress(context: Context, hospitalId: string, addressId: number): Promise<void> {
    logger.info(`deleting address for hospital with id ${hospitalId}`)
    await this.restClient.delete(
      {
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deleteHospitalPhoneNumber(context: Context, hospitalId: string, phoneId: number): Promise<void> {
    logger.info(`deleting phone number for hospital with id ${hospitalId}`)
    await this.restClient.delete(
      {
        path: `/hospitals/id/${encodeURIComponent(hospitalId)}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
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
    logger.info(`getting all probation offices with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<ProbationOffice[]>(
      {
        path: `/probation-offices`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getProbationOffice(context: Context, probationOfficeId: string): Promise<ProbationOffice> {
    logger.info(`getting probation office with id ${probationOfficeId}`)
    return this.restClient.get<ProbationOffice>(
      {
        path: `/probation-offices/id/${probationOfficeId}`,
      },
      asSystem(context.username),
    )
  }

  async createProbationOffice(
    context: Context,
    probationOffice: CreateProbationOffice,
  ): Promise<AgencyMutationResponse> {
    logger.info(`creating probation office with id ${probationOffice.probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<ProbationOffice>(
        {
          path: '/probation-offices',
          data: probationOffice,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateProbationOfficeDetails(
    context: Context,
    probationOfficeId: string,
    probationOffice: UpdateProbationOffice,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating details for probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<ProbationOffice>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}`,
          data: probationOffice,
        },
        asSystem(context.username),
      ),
    )
  }

  async addProbationOfficeAddress(
    context: Context,
    probationOfficeId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/address`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async updateProbationOfficeAddress(
    context: Context,
    probationOfficeId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/address/${addressId}`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async addProbationOfficePhoneNumber(
    context: Context,
    probationOfficeId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateProbationOfficePhoneNumber(
    context: Context,
    probationOfficeId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async addProbationOfficeEmailAddress(
    context: Context,
    probationOfficeId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding email address to probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyEmailAddress>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/email-address`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateProbationOfficeEmailAddress(
    context: Context,
    probationOfficeId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating email address for probation office with id ${probationOfficeId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyEmailAddress>(
        {
          path: `/probation-offices/id/${encodeURIComponent(probationOfficeId)}/email-address/${emailId}`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async getPoliceCustodySuites(context: Context, filter: PoliceCustodySuiteFilter): Promise<PoliceCustodySuite[]> {
    logger.info(`getting all police custody suites with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<PoliceCustodySuite[]>(
      {
        path: `/police-custody-suites`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getPoliceCustodySuite(context: Context, policeCustodySuiteId: string): Promise<PoliceCustodySuite> {
    logger.info(`getting police custody suite with id ${policeCustodySuiteId}`)
    return this.restClient.get<PoliceCustodySuite>(
      {
        path: `/police-custody-suites/id/${policeCustodySuiteId}`,
      },
      asSystem(context.username),
    )
  }

  async createPoliceCustodySuite(
    context: Context,
    policeCustodySuite: CreatePoliceCustodySuite,
  ): Promise<AgencyMutationResponse> {
    logger.info(`creating police custody suite with id ${policeCustodySuite.policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<PoliceCustodySuite>(
        {
          path: '/police-custody-suites',
          data: policeCustodySuite,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePoliceCustodySuiteDetails(
    context: Context,
    policeCustodySuiteId: string,
    policeCustodySuite: UpdatePoliceCustodySuite,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating details for police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<PoliceCustodySuite>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}`,
          data: policeCustodySuite,
        },
        asSystem(context.username),
      ),
    )
  }

  async addPoliceCustodySuiteAddress(
    context: Context,
    policeCustodySuiteId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/address`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePoliceCustodySuiteAddress(
    context: Context,
    policeCustodySuiteId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/address/${addressId}`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async addPoliceCustodySuitePhoneNumber(
    context: Context,
    policeCustodySuiteId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePoliceCustodySuitePhoneNumber(
    context: Context,
    policeCustodySuiteId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async addPoliceCustodySuiteEmailAddress(
    context: Context,
    policeCustodySuiteId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding email address to police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyEmailAddress>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/email-address`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async updatePoliceCustodySuiteEmailAddress(
    context: Context,
    policeCustodySuiteId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating email address for police custody suite with id ${policeCustodySuiteId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyEmailAddress>(
        {
          path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/email-address/${emailId}`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async deletePoliceCustodySuite(context: Context, policeCustodySuiteId: string): Promise<void> {
    logger.info(`deleting police custody suite with id ${policeCustodySuiteId}`)
    await this.restClient.delete(
      {
        path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}`,
      },
      asSystem(context.username),
    )
  }

  async deletePoliceCustodySuiteAddress(
    context: Context,
    policeCustodySuiteId: string,
    addressId: number,
  ): Promise<void> {
    logger.info(`deleting address for police custody suite with id ${policeCustodySuiteId}`)
    await this.restClient.delete(
      {
        path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/address/${addressId}`,
      },
      asSystem(context.username),
    )
  }

  async deletePoliceCustodySuitePhoneNumber(
    context: Context,
    policeCustodySuiteId: string,
    phoneId: number,
  ): Promise<void> {
    logger.info(`deleting phone number for police custody suite with id ${policeCustodySuiteId}`)
    await this.restClient.delete(
      {
        path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/phone-number/${phoneId}`,
      },
      asSystem(context.username),
    )
  }

  async deletePoliceCustodySuiteEmailAddress(
    context: Context,
    policeCustodySuiteId: string,
    emailId: number,
  ): Promise<void> {
    logger.info(`deleting email address for police custody suite with id ${policeCustodySuiteId}`)
    await this.restClient.delete(
      {
        path: `/police-custody-suites/id/${encodeURIComponent(policeCustodySuiteId)}/email-address/${emailId}`,
      },
      asSystem(context.username),
    )
  }

  async getAllApprovedPremises(context: Context, filter: ApprovedPremisesFilter): Promise<ApprovedPremises[]> {
    logger.info(`getting all approved premises with filter ${JSON.stringify(filter)}`)
    return this.restClient.get<ApprovedPremises[]>(
      {
        path: `/approved-premises`,
        query: `${querystring.stringify(filter)}`,
      },
      asSystem(context.username),
    )
  }

  async getApprovedPremises(context: Context, approvedPremisesId: string): Promise<ApprovedPremises> {
    logger.info(`getting approved premises with id ${approvedPremisesId}`)
    return this.restClient.get<ApprovedPremises>(
      {
        path: `/approved-premises/id/${approvedPremisesId}`,
      },
      asSystem(context.username),
    )
  }

  async createApprovedPremises(
    context: Context,
    approvedPremises: CreateApprovedPremises,
  ): Promise<AgencyMutationResponse> {
    logger.info(`creating approved premises with id ${approvedPremises.approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<ApprovedPremises>(
        {
          path: '/approved-premises',
          data: approvedPremises,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateApprovedPremisesDetails(
    context: Context,
    approvedPremisesId: string,
    approvedPremises: UpdateApprovedPremises,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating details for approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<ApprovedPremises>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}`,
          data: approvedPremises,
        },
        asSystem(context.username),
      ),
    )
  }

  async addApprovedPremisesAddress(
    context: Context,
    approvedPremisesId: string,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding address to approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyAddress>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/address`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async updateApprovedPremisesAddress(
    context: Context,
    approvedPremisesId: string,
    addressId: number,
    address: UpdateAgencyAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating address for approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyAddress>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/address/${addressId}`,
          data: HMPPSAgencyRegisterApi.agencyAddressData(address),
        },
        asSystem(context.username),
      ),
    )
  }

  async addApprovedPremisesPhoneNumber(
    context: Context,
    approvedPremisesId: string,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding phone number to approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyPhoneNumber>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/phone-number`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateApprovedPremisesPhoneNumber(
    context: Context,
    approvedPremisesId: string,
    phoneId: number,
    phoneNumber: PhoneNumber,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating phone number for approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyPhoneNumber>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/phone-number/${phoneId}`,
          data: phoneNumber,
        },
        asSystem(context.username),
      ),
    )
  }

  async addApprovedPremisesEmailAddress(
    context: Context,
    approvedPremisesId: string,
    emailAddress: EmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`adding email address to approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.post<AgencyEmailAddress>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/email-address`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async updateApprovedPremisesEmailAddress(
    context: Context,
    approvedPremisesId: string,
    emailId: number,
    emailAddress: UpdateEmailAddress,
  ): Promise<AgencyMutationResponse> {
    logger.info(`updating email address for approved premises with id ${approvedPremisesId}`)
    return HMPPSAgencyRegisterApi.agencyMutation(() =>
      this.restClient.put<AgencyEmailAddress>(
        {
          path: `/approved-premises/id/${encodeURIComponent(approvedPremisesId)}/email-address/${emailId}`,
          data: emailAddress,
        },
        asSystem(context.username),
      ),
    )
  }

  async getTownSuggestions(context: Context): Promise<CodeDescription[]> {
    logger.info(`getting town suggestions`)
    return this.restClient.get<CodeDescription[]>(
      {
        path: `/reference-data/suggestions/towns`,
      },
      asSystem(context.username),
    )
  }

  async getAreas(context: Context): Promise<CodeDescription[]> {
    return this.restClient.get<CodeDescription[]>(
      {
        path: '/reference-data/areas',
      },
      asSystem(context.username),
    )
  }

  async getPayrollRegions(context: Context): Promise<CodeDescription[]> {
    return this.restClient.get<CodeDescription[]>(
      {
        path: '/reference-data/payroll-regions',
      },
      asSystem(context.username),
    )
  }

  async getLocalAuthorities(context: Context): Promise<CodeDescription[]> {
    return this.restClient.get<CodeDescription[]>(
      {
        path: '/reference-data/local-authorities',
      },
      asSystem(context.username),
    )
  }

  async getPrisonOperators(context: Context): Promise<PrisonOperator[]> {
    return this.restClient.get<PrisonOperator[]>(
      {
        path: '/reference-data/prison-operators',
      },
      asSystem(context.username),
    )
  }

  async getRegions(context: Context): Promise<CodeDescription[]> {
    return this.restClient.get<CodeDescription[]>(
      {
        path: '/reference-data/regions',
      },
      asSystem(context.username),
    )
  }

  async getCountySuggestions(context: Context): Promise<CodeDescription[]> {
    logger.info(`getting county suggestions`)
    return this.restClient.get<CodeDescription[]>(
      {
        path: `/reference-data/suggestions/counties`,
      },
      asSystem(context.username),
    )
  }
}

const undefinedWhenAbsent = (value: string | undefined): string | undefined =>
  (value && value.trim().length > 0 && value) || undefined
