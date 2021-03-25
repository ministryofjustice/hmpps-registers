import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors: Array<{ text: string; href: string }> = []

  if (form.telephonenumber.trim().length === 0) {
    errors.push({ text: 'Enter the telephone number', href: '#telephonenumber' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-contact-details'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-summary'
}
