import { Request } from 'express'
import type { UpdateAddressForm } from 'agencyForms'
import validateAddress from '../../validation/addressValidation'
import { UpdatePrisonAddress } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

export default async function validate(
  form: UpdateAddressForm,
  req: Request,
  updateAddress: (address: UpdatePrisonAddress) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = validateAddress(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/address/update?id=${id}&addressId=${form.addressId}`
  }

  const result = await updateAddress({
    addressLine1: form.addressline1,
    addressLine2: form.addressline2,
    town: form.addresstown,
    county: form.addresscounty,
    postcode: form.addresspostcode,
    country: form.addresscountry,
  })
  if (result.success === false) {
    req.flash('errors', [{ href: '#addressline1', text: result.userMessage }])
    return `/court-register/address/update?id=${id}&addressId=${form.addressId}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
