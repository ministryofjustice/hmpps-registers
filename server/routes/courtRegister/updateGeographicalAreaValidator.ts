import { Request } from 'express'
import type { UpdateGeographicalAreaForm } from 'agencyForms'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdateGeographicalAreaForm,
  req: Request,
  getGeographicalAreas: () => Promise<CodeDescription[]>,
  updateGeographicalArea: (geographicalAreaCode?: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const geographicalAreaCode = form.geographicalAreaCode || undefined
  if (
    geographicalAreaCode &&
    !(await getGeographicalAreas()).some(geographicalArea => geographicalArea.code === geographicalAreaCode)
  ) {
    req.flash('errors', [{ href: '#geographicalArea', text: 'Select a valid geographical area from the suggestions' }])
    return `/court-register/geographical-area/update?id=${id}`
  }
  const result = await updateGeographicalArea(geographicalAreaCode)
  if (result.success === false) {
    req.flash('errors', [{ href: '#geographicalArea', text: result.userMessage }])
    return `/court-register/geographical-area/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
