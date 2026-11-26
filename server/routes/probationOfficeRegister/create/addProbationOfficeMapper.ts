import { CreateProbationOffice } from '../../../@types/prisonRegister'
import { AddProbationOfficeJourney } from './addProbationOfficeFlowControl'

export default function addProbationOfficeMapper({ form }: AddProbationOfficeJourney): CreateProbationOffice {
  if (!form.probationOfficeId || !form.probationOfficeName) {
    throw new Error('Cannot create a probation office from an incomplete journey')
  }
  return {
    probationOfficeId: form.probationOfficeId,
    probationOfficeName: form.probationOfficeName,
    description: form.description || undefined,
    contact: form.contact || undefined,
    active: true,
    accessibleAccess:
      form.accessibleAccess && form.accessibleAccess !== 'UNKNOWN'
        ? (form.accessibleAccess as CreateProbationOffice['accessibleAccess'])
        : undefined,
    cjitCode: form.cjitCode || undefined,
    areaCode: form.areaCode || undefined,
    regionCode: form.regionCode || undefined,
    geographicalAreaCode: form.geographicalAreaCode || undefined,
    localAuthorityCode: form.localAuthorityCode || undefined,
    payrollRegionCode: form.payrollRegionCode || undefined,
    addresses: [],
    emailAddresses: [],
    phoneNumbers: [],
  }
}
