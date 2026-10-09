import { Request } from 'express'
import type { UpdateEmailAddressForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import { AgencyEmailAddress, UpdateEmailAddress } from '../../@types/prisonRegister'

export default async function validate(
  form: UpdateEmailAddressForm,
  req: Request,
  updateEmailAddress: (addEmailAddress: UpdateEmailAddress) => Promise<AgencyEmailAddress>,
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

  await updateEmailAddress(asEmailAddress(form))

  return `/court-register/details?id=${id}`
}

function asEmailAddress(form: UpdateEmailAddressForm): UpdateEmailAddress {
  return {
    address: form.emailAddress as string,
  }
}
