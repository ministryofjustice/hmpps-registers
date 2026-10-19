import { CreateCourt } from '../../../@types/prisonRegister'
import { isAccessibleAccessOption } from '../accessibleAccessData'
import { AddCourtJourney } from './addCourtFlowControl'

export default function addCourtMapper({ form }: AddCourtJourney): CreateCourt {
  if (!form.courtId || !form.courtName || !form.courtType || !isAccessibleAccessOption(form.accessibleAccess)) {
    throw new Error('Cannot create a court from an incomplete journey')
  }
  return {
    courtId: form.courtId,
    courtName: form.courtName,
    description: form.description || undefined,
    active: true,
    courtTypeCode: form.courtType,
    accessibleAccess: form.accessibleAccess === 'UNKNOWN' ? undefined : form.accessibleAccess,
    cjitCode: form.cjitCode || undefined,
    areaCode: form.areaCode || undefined,
    regionCode: form.regionCode || undefined,
    geographicalAreaCode: form.geographicalAreaCode || undefined,
    localAuthorityCode: form.localAuthorityCode || undefined,
    payrollRegionCode: form.payrollRegionCode || undefined,
    addresses: [],
    phoneNumbers: [],
    emailAddresses: [],
  }
}
