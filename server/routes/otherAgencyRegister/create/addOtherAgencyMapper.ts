import { CreateOtherAgency } from '../../../@types/prisonRegister'
import { AddOtherAgencyJourney } from './addOtherAgencyFlowControl'

export default function addOtherAgencyMapper({ form }: AddOtherAgencyJourney): CreateOtherAgency {
  if (!form.agencyId || !form.agencyName || !form.agencyType) {
    throw new Error('Cannot create an other agency from an incomplete journey')
  }
  return {
    agencyId: form.agencyId,
    agencyName: form.agencyName,
    description: form.description || undefined,
    otherAgencyType: form.agencyType as CreateOtherAgency['otherAgencyType'],
    active: true,
    accessibleAccess:
      form.accessibleAccess && form.accessibleAccess !== 'UNKNOWN'
        ? (form.accessibleAccess as CreateOtherAgency['accessibleAccess'])
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
