import { Request } from 'express'
import type { UpdateLocalAuthorityForm } from 'agencyForms'
import { validateReference } from '../../validation/agencyFields'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateLocalAuthorityForm,
  req: Request,
  getLocalAuthorities: () => Promise<CodeDescription[]>,
  updateLocalAuthority: (localAuthorityCode?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const localAuthorityCode = form.localAuthorityCode || undefined
  const { errors, selected } = await validateReference(
    localAuthorityCode,
    form.localAuthorityDescription,
    'localAuthority',
    'local authority',
    getLocalAuthorities,
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/local-authority/update?id=${id}`
  }
  const result = await updateLocalAuthority(localAuthorityCode)
  if (result.success === false) {
    if (selected)
      req.session.updateLocalAuthorityForm = {
        ...form,
        localAuthorityDescription: selected.description,
      }
    req.flash('errors', [{ href: '#localAuthority', text: result.userMessage }])
    return `/court-register/local-authority/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
