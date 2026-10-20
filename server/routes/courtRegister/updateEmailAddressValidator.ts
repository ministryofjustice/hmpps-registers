import { Request } from 'express'
import type { UpdateEmailAddressForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import { UpdateEmailAddress } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdateEmailAddressForm,
  req: Request,
  updateEmailAddress: (emailAddress: UpdateEmailAddress) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    {
      emailAddress: ['required', 'email'],
    },
    {
      'required.emailAddress': 'Enter an email address',
      'email.emailAddress': 'Enter a valid email address',
    },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/email/update?id=${id}&emailId=${form.emailId}`
  }

  const result = await updateEmailAddress(asEmailAddress(form))
  if (result.success === false) {
    req.flash('errors', [{ href: '#emailAddress', text: result.userMessage }])
    return `/court-register/email/update?id=${id}&emailId=${form.emailId}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}

function asEmailAddress(form: UpdateEmailAddressForm): UpdateEmailAddress {
  return {
    address: form.emailAddress as string,
  }
}
