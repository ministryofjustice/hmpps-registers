import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors: Array<{ text: string; href: string }> = []

  if (form.name.trim().length === 0) {
    errors.push({ text: 'Enter a court name', href: '#name' })
  }
  if (form.id.trim().length === 0) {
    errors.push({ text: 'Enter a court code', href: '#id' })
  }
  if (form.type.trim().length === 0) {
    errors.push({ text: 'Select a court type', href: '#type' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-details'
  }
  return '/court-register/add-new-court-building'
}
