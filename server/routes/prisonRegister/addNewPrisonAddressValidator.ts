import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { validate as validateSync } from '../../validation/validation'

export default function validate(form: AddNewPrisonForm, req: Request): string {
  const errors = validateSync(
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
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/prison-register/add-new-prison-address'
  }
  return '/prison-register/add-new-prison-summary'
}
