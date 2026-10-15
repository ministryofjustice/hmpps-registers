import { Request } from 'express'
import type { UpdateCjitCodeForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdateCjitCodeForm,
  req: Request,
  updateCjitCode: (cjitCode: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    { cjitCode: ['max:12'] },
    { 'max.cjitCode': 'CJIT code must be 12 characters or fewer' },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/cjit-code/update?id=${id}`
  }

  const result = await updateCjitCode(form.cjitCode ?? '')
  if (result.success === false) {
    req.flash('errors', [{ href: '#cjitCode', text: result.userMessage }])
    return `/court-register/cjit-code/update?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
