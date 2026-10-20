import { Request } from 'express'
import type { UpdateAreaForm } from 'agencyForms'
import { validateReference } from '../../validation/agencyFields'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateAreaForm,
  req: Request,
  getAreas: () => Promise<CodeDescription[]>,
  updateArea: (areaCode?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const areaCode = form.areaCode || undefined
  const { errors, selected } = await validateReference(areaCode, form.areaDescription, 'area', 'area', getAreas)
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/area/update?id=${id}`
  }
  const result = await updateArea(areaCode)
  if (result.success === false) {
    if (selected) req.session.updateAreaForm = { ...form, areaDescription: selected.description }
    req.flash('errors', [{ href: '#area', text: result.userMessage }])
    return `/court-register/area/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
