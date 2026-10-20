import { Request } from 'express'
import type { UpdateLocalAuthorityForm } from 'agencyForms'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateLocalAuthorityForm,
  req: Request,
  getLocalAuthorities: () => Promise<CodeDescription[]>,
  updateLocalAuthority: (localAuthorityCode?: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const localAuthorityCode = form.localAuthorityCode || undefined
  if (
    localAuthorityCode &&
    !(await getLocalAuthorities()).some(localAuthority => localAuthority.code === localAuthorityCode)
  ) {
    req.flash('errors', [{ href: '#localAuthority', text: 'Select a valid local authority from the suggestions' }])
    return `/court-register/local-authority/update?id=${id}`
  }
  const result = await updateLocalAuthority(localAuthorityCode)
  if (result.success === false) {
    req.flash('errors', [{ href: '#localAuthority', text: result.userMessage }])
    return `/court-register/local-authority/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
