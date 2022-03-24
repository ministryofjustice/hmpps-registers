import { Request } from 'express'
import type { AmendPrisonDetailsForm } from 'prisonForms'
import { validate as validateSync } from '../../validation/validation'

export default async function validate(
  form: AmendPrisonDetailsForm,
  req: Request,
  updateService: (id: string, name: string, gender?: string[], prisonTypes?: string[]) => Promise<void>
): Promise<string> {
  const errors = validateSync(
    form,
    {
      name: ['required', 'between:3,80'],
    },
    {
      'required.name': 'Enter a prison name',
      'between.name': 'Enter a prison name between 3 and 80 characters',
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/prison-register/amend-prison-details`
  }

  await updateService(form.id, form.name, form.gender, form.prisonTypes)

  return `/prison-register/details?id=${form.id}&action=UPDATED`
}
