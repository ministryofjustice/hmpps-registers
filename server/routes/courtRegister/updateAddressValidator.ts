import { Request } from 'express'
import type { UpdateAddressForm } from 'agencyForms'
import validateAddress from '../../validation/addressValidation'
import { AgencyAddress, UpdatePrisonAddress } from '../../@types/prisonRegister'

export default async function validate(
  form: UpdateAddressForm,
  req: Request,
  updateAddress: (address: UpdatePrisonAddress) => Promise<AgencyAddress>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = validateAddress(form)

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/address/update?id=${id}&addressId=${form.addressId}`
  }

  await updateAddress({
    addressLine1: form.addressline1,
    addressLine2: form.addressline2,
    town: form.addresstown,
    county: form.addresscounty,
    postcode: form.addresspostcode,
    country: form.addresscountry,
  })

  return `/court-register/details?id=${id}&action=UPDATED`
}
