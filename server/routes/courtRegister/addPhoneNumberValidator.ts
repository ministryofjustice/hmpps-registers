import { Request } from 'express'
import type { AddPhoneNumberForm } from 'agencyForms'
import validatePhoneNumber from '../../validation/phoneNumberValidation'
import { PhoneNumber } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: AddPhoneNumberForm,
  req: Request,
  addPhoneNumber: (phoneNumber: PhoneNumber) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validatePhoneNumber(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/phone/create?id=${id}`
  }

  const result = await addPhoneNumber({ number: form.phoneNumber })
  if (result.success === false) {
    req.flash('errors', [{ href: '#phoneNumber', text: result.userMessage }])
    return `/court-register/phone/create?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
