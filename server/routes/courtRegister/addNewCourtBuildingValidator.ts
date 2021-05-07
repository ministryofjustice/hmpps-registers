import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors = validateSync(
    form,
    {
      buildingname: ['required', 'between:0,50'],
      addressline1: ['required', 'between:0,80'],
      addressline2: 'between:0,80',
      addresstown: ['required', 'between:0,80'],
      addresscounty: ['required', 'between:0,80'],
      addresspostcode: ['required', 'postcode', 'between:0,8'],
      addresscountry: 'required',
    },
    {
      'required.buildingname': 'Enter the building name',
      'required.addressline1': 'Enter the first line of the address',
      'required.addresstown': 'Enter the town or city',
      'required.addresscounty': 'Enter the county',
      'required.addresspostcode': 'Enter the postcode, like AA11AA',
      'required.addresscountry': 'Select the country',
      'between.buildingname': 'Enter the building name not greater than 50 characters',
      'between.addressline1': 'Enter the first line of the address not greater than 80 characters',
      'between.addressline2': 'Enter the second line of the address not greater than 80 characters',
      'between.addresstown': 'Enter the town or city not greater than 80 characters',
      'between.addresscounty': 'Enter the county not greater than 80 characters',
      'between.addresspostcode': 'Enter the postcode, like AA11AA',
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-building'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-contact-details'
}
