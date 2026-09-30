import { Request } from 'express'
import type { AddEmailAddressForm } from 'prisonForms'
import { validateAsync } from '../../validation/agencyValidation'
import { AgencyEmailAddress, EmailAddress } from '../../@types/prisonRegister'

export default async function validate(
  form: AddEmailAddressForm,
  req: Request,
  addEmailAddress: (addEmailAddress: EmailAddress) => Promise<AgencyEmailAddress>,
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

  await addEmailAddress(asEmailAddress(form))

  return `/court-register/details?id=${id}`
}

function asEmailAddress(form: AddEmailAddressForm): EmailAddress {
  return {
    address: form.emailAddress as string,
  }
}
