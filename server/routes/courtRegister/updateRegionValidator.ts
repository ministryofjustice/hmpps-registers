import { Request } from 'express'
import type { UpdateRegionForm } from 'agencyForms'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdateRegionForm,
  req: Request,
  getRegions: () => Promise<CodeDescription[]>,
  updateRegion: (regionCode?: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const regionCode = form.regionCode || undefined
  if (regionCode && !(await getRegions()).some(region => region.code === regionCode)) {
    req.flash('errors', [{ href: '#region', text: 'Select a valid region from the suggestions' }])
    return `/court-register/region/update?id=${id}`
  }
  const result = await updateRegion(regionCode)
  if (result.success === false) {
    req.flash('errors', [{ href: '#region', text: result.userMessage }])
    return `/court-register/region/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
