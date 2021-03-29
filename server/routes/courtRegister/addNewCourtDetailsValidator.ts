import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { components } from '../../@types/courtRegisterImport'

type Court = components['schemas']['CourtDto']

export default async function validate(
  form: AddNewCourtForm,
  req: Request,
  courtLookup: (id: string) => Promise<Court>
): Promise<string> {
  const errors: Array<{ text: string; href: string }> = []

  if (form.name.trim().length === 0) {
    errors.push({ text: 'Enter a court name', href: '#name' })
  } else if (form.name.trim().length < 2) {
    errors.push({ text: 'Court name must be at least 2 characters', href: '#name' })
  }
  if (form.name.trim().length > 200) {
    errors.push({ text: 'Court name must be 200 characters or fewer', href: '#name' })
  }
  if (form.id.trim().length === 0) {
    errors.push({ text: 'Enter a court code', href: '#id' })
  } else if (form.id.trim().length < 2) {
    errors.push({ text: 'Court code must be at least 2 characters', href: '#id' })
  } else {
    const court = await courtLookup(form.id)
    if (court) {
      errors.push({ text: `${court.courtName} already has that code. Choose another code`, href: '#id' })
    }
  }
  if (form.id.trim().length > 12) {
    errors.push({ text: 'Court code must be 12 characters or fewer', href: '#id' })
  }
  if (form.type.trim().length === 0) {
    errors.push({ text: 'Select a court type', href: '#type' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-details'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-building'
}
