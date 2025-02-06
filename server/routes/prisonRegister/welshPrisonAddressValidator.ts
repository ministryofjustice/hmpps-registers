import { Request } from 'express'
import type { WelshPrisonAddressForm } from 'prisonForms'
import validateSync from '../../validation/validation'

export default async function validate(
  form: WelshPrisonAddressForm,
  req: Request,
  errorUrl: string,
  updateService: (welshPrisonAddressForm: WelshPrisonAddressForm) => Promise<void>,
): Promise<string> {
  const errors = validateSync(
    form,
    {
      addressline1inwelsh: ['between:0,80'],
      addressline2inwelsh: 'between:0,80',
      towninwelsh: ['required', 'between:0,80'],
      countyinwelsh: ['between:0,80'],
    },
    {
      'required.towninwelsh': 'Enter the town or city',
      'between.addressline1inwelsh': 'Enter the first line of the address not greater than 80 characters',
      'between.addressline2inwelsh': 'Enter the second line of the address not greater than 80 characters',
      'between.towninwelsh': 'Enter the town or city not greater than 80 characters',
      'between.countyinwelsh': 'Enter the county not greater than 80 characters',
    },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return errorUrl
  }

  await updateService(form)

  return `/prison-register/details?id=${form.prisonId}&action=UPDATED`
}
