import { Request } from 'express'
import type { AmendCourtDetailsForm } from 'forms'

export default async function validate(
  form: AmendCourtDetailsForm,
  req: Request,
  updateService: (id: string, name: string, type: string, description: string) => Promise<void>
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
  if (form.type.trim().length === 0) {
    errors.push({ text: 'Select a court type', href: '#type' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/amend-court-details`
  }

  await updateService(form.id, form.name, form.type, form.description)

  return `/court-register/details?id=${form.id}&action=UPDATED`
}
