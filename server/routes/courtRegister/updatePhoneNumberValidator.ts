import { Request } from 'express'
import type { UpdatePhoneNumberForm } from 'agencyForms'
import validatePhoneNumber from '../../validation/phoneNumberValidation'
import { PhoneNumber } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdatePhoneNumberForm,
  req: Request,
  updatePhoneNumber: (phoneNumber: PhoneNumber) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validatePhoneNumber(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/phone/update?id=${id}&phoneId=${form.phoneId}`
  }

  const result = await updatePhoneNumber({ number: form.phoneNumber })
  if (result.success === false) {
    req.flash('errors', [{ href: '#phoneNumber', text: result.userMessage }])
    return `/court-register/phone/update?id=${id}&phoneId=${form.phoneId}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
