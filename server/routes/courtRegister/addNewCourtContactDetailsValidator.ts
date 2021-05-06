import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors = validateSync(
    form,
    {
      telephonenumber: ['required', 'between:0,80'],
      faxnumber: 'between:0,80',
    },
    {
      'required.telephonenumber': 'Enter the telephone number',
      'between.telephonenumber': 'Enter the telephone number not greater than 80 characters',
      'between.faxnumber': 'Enter the fax number not greater than 80 characters',
    }
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-contact-details'
  }
  return '/court-register/add-new-court-summary'
}
