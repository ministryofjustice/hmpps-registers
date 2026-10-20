import { Request } from 'express'
import type { UpdateGeographicalAreaForm } from 'agencyForms'
import { validateReference } from '../../validation/agencyFields'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateGeographicalAreaForm,
  req: Request,
  getGeographicalAreas: () => Promise<CodeDescription[]>,
  updateGeographicalArea: (geographicalAreaCode?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const geographicalAreaCode = form.geographicalAreaCode || undefined
  const { errors, selected } = await validateReference(
    geographicalAreaCode,
    form.geographicalAreaDescription,
    'geographicalArea',
    'geographical area',
    getGeographicalAreas,
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/geographical-area/update?id=${id}`
  }
  const result = await updateGeographicalArea(geographicalAreaCode)
  if (result.success === false) {
    if (selected)
      req.session.updateGeographicalAreaForm = {
        ...form,
        geographicalAreaDescription: selected.description,
      }
    req.flash('errors', [{ href: '#geographicalArea', text: result.userMessage }])
    return `/court-register/geographical-area/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
