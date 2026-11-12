import { Request } from 'express'
import type { UpdatePrisonDetailForm } from 'prisonForms'
import validateSync from '../../validation/validation'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { PrisonDetailField } from './prisonDetailFields'

export default async function validate(
  config: PrisonDetailField,
  form: UpdatePrisonDetailForm,
  req: Request,
  update: (form: UpdatePrisonDetailForm) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const updateUrl = `/prison-register/${config.path}/update?id=${id}`

  const errors = validateSync(form, config.rules, config.messages)
  if (errors.length > 0) {
    req.flash('errors', errors)
    return updateUrl
  }

  const result = await update(form)
  if (result.success === false) {
    req.flash('errors', [{ href: `#${config.field}`, text: result.userMessage }])
    return updateUrl
  }

  return `/prison-register/details?id=${id}&action=UPDATED`
}
