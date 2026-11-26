import { CreateApprovedPremises } from '../../../@types/prisonRegister'
import { AddApprovedPremisesJourney } from './addApprovedPremisesFlowControl'

export default function addApprovedPremisesMapper({ form }: AddApprovedPremisesJourney): CreateApprovedPremises {
  if (!form.approvedPremisesId || !form.approvedPremisesName) {
    throw new Error('Cannot create a approved premises from an incomplete journey')
  }
  return {
    approvedPremisesId: form.approvedPremisesId,
    approvedPremisesName: form.approvedPremisesName,
    description: form.description || undefined,
    contact: form.contact || undefined,
    active: true,
    accessibleAccess:
      form.accessibleAccess && form.accessibleAccess !== 'UNKNOWN'
        ? (form.accessibleAccess as CreateApprovedPremises['accessibleAccess'])
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
