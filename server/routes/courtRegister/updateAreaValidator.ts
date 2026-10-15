import { Request } from 'express'
import type { UpdateAreaForm } from 'agencyForms'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdateAreaForm,
  req: Request,
  getAreas: () => Promise<CodeDescription[]>,
  updateArea: (areaCode?: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const areaCode = form.areaCode || undefined
  if (areaCode && !(await getAreas()).some(area => area.code === areaCode)) {
    req.flash('errors', [{ href: '#area', text: 'Select a valid area from the suggestions' }])
    return `/court-register/area/update?id=${id}`
  }
  const result = await updateArea(areaCode)
  if (result.success === false) {
    req.flash('errors', [{ href: '#area', text: result.userMessage }])
    return `/court-register/area/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
