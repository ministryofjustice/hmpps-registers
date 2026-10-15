import { Request } from 'express'
import type { UpdateAccessibleAccessForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'
import type { UpdateCourt } from '../../@types/prisonRegister'
import { isAccessibleAccessOption } from './accessibleAccessData'

export default async function validate(
  form: UpdateAccessibleAccessForm,
  req: Request,
  updateAccessibleAccess: (accessibleAccess: UpdateCourt['accessibleAccess']) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    { accessibleAccess: ['required'] },
    { 'required.accessibleAccess': 'Select an accessible access option' },
  )

  if (!isAccessibleAccessOption(form.accessibleAccess)) {
    if (errors.length === 0) {
      errors.push({ href: '#accessibleAccess', text: 'Select a valid accessible access option' })
    }
    req.flash('errors', errors)
    return `/court-register/accessible-access/update?id=${id}`
  }

  const result = await updateAccessibleAccess(form.accessibleAccess === 'UNKNOWN' ? undefined : form.accessibleAccess)
  if (result.success === false) {
    req.flash('errors', [{ href: '#accessibleAccess', text: result.userMessage }])
    return `/court-register/accessible-access/update?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
