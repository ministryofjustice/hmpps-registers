import { Request } from 'express'
import type { UpdateRegionForm } from 'agencyForms'
import { validateReference } from '../../validation/agencyFields'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateRegionForm,
  req: Request,
  getRegions: () => Promise<CodeDescription[]>,
  updateRegion: (regionCode?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const regionCode = form.regionCode || undefined
  const { errors, selected } = await validateReference(
    regionCode,
    form.regionDescription,
    'region',
    'region',
    getRegions,
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/region/update?id=${id}`
  }
  const result = await updateRegion(regionCode)
  if (result.success === false) {
    if (selected) req.session.updateRegionForm = { ...form, regionDescription: selected.description }
    req.flash('errors', [{ href: '#region', text: result.userMessage }])
    return `/court-register/region/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
