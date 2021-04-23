import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors = validateSync(
    form,
    {
      telephonenumber: 'required',
    },
    {
      'required.telephonenumber': 'Enter the telephone number',
    }
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-contact-details'
  }
  return '/court-register/add-new-court-summary'
}
