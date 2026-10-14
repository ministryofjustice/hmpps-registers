import { Request } from 'express'
import type { AddEmailAddressForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import { EmailAddress } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: AddEmailAddressForm,
  req: Request,
  addEmailAddress: (addEmailAddress: EmailAddress) => Promise<CourtMutationResponse>,
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
    return `/court-register/email/create?id=${id}`
  }

  const result = await addEmailAddress(asEmailAddress(form))
  if (result.success === false) {
    req.flash('errors', [{ href: '#emailAddress', text: result.userMessage }])
    return `/court-register/email/create?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}

function asEmailAddress(form: AddEmailAddressForm): EmailAddress {
  return {
    address: form.emailAddress as string,
  }
}
