import { Request } from 'express'
import type { UpdatePhoneNumberForm } from 'agencyForms'
import validatePhoneNumber from '../../validation/phoneNumberValidation'
import { AgencyPhoneNumber, PhoneNumber } from '../../@types/prisonRegister'

export default async function validate(
  form: UpdatePhoneNumberForm,
  req: Request,
  updatePhoneNumber: (phoneNumber: PhoneNumber) => Promise<AgencyPhoneNumber>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validatePhoneNumber(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/phone/update?id=${id}&phoneId=${form.phoneId}`
  }

  await updatePhoneNumber({ number: form.phoneNumber })

  return `/court-register/details?id=${id}&action=UPDATED`
}
