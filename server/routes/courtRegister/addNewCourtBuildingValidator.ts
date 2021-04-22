import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors = validateSync(
    form,
    {
      buildingname: 'required',
      addressline1: 'required',
      addresstown: 'required',
      addresscounty: 'required',
      addresspostcode: ['required', 'postcode'],
      addresscountry: 'required',
    },
    {
      'required.buildingname': 'Enter the building name',
      'required.addressline1': 'Enter the first line of the address',
      'required.addresstown': 'Enter the town or city',
      'required.addresscounty': 'Enter the county',
      'required.addresspostcode': 'Enter the postcode, like AA11AA',
      'required.addresscountry': 'Select the country',
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-building'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-contact-details'
}
