import { Request } from 'express'
import type { AddPhoneNumberForm } from 'agencyForms'
import validatePhoneNumber from '../../validation/phoneNumberValidation'
import { AgencyPhoneNumber, PhoneNumber } from '../../@types/prisonRegister'

export default async function validate(
  form: AddPhoneNumberForm,
  req: Request,
  addPhoneNumber: (phoneNumber: PhoneNumber) => Promise<AgencyPhoneNumber>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validatePhoneNumber(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/phone/create?id=${id}`
  }

  await addPhoneNumber({ number: form.phoneNumber })

  return `/court-register/details?id=${id}&action=UPDATED`
}
