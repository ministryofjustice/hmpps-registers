import type { AddAddressForm } from 'agencyForms'
import validateSync from './validation'

export default function validateAddress(form: AddAddressForm): Array<{ text: string; href: string }> {
  return validateSync(
    form,
    {
      addressline1: 'between:0,80',
      addressline2: 'between:0,80',
      addresstown: ['required', 'between:0,80'],
      addresscounty: 'between:0,80',
      addresspostcode: ['required', 'postcode', 'between:0,8'],
      addresscountry: 'required',
    },
    {
      'required.addresstown': 'Enter the town or city',
      'required.addresspostcode': 'Enter the postcode, like AA11AA',
      'required.addresscountry': 'Select the country',
      'between.addressline1': 'Enter the first line of the address not greater than 80 characters',
      'between.addressline2': 'Enter the second line of the address not greater than 80 characters',
      'between.addresstown': 'Enter the town or city not greater than 80 characters',
      'between.addresscounty': 'Enter the county not greater than 80 characters',
      'between.addresspostcode': 'Enter the postcode, like AA11AA',
    },
  )
}
