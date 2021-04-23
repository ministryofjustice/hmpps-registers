import { Request } from 'express'
import type { AmendCourtDetailsForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

export default async function validate(
  form: AmendCourtDetailsForm,
  req: Request,
  updateService: (id: string, name: string, type: string, description: string) => Promise<void>
): Promise<string> {
  const errors = await validateSync(
    form,
    {
      name: ['required', 'between:2,200'],
      type: 'required',
    },
    {
      'required.name': 'Enter a court name',
      'between.name': 'Enter a court name between 2 and 200 characters',
      'required.type': 'Select a court type',
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/amend-court-details`
  }

  await updateService(form.id, form.name, form.type, form.description)

  return `/court-register/details?id=${form.id}&action=UPDATED`
}
