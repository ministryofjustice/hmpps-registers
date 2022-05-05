import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { Prison } from '../../@types/prisonRegister'
import { validateAsync } from '../../validation/prisonValidation'

export default async function validate(
  form: AddNewPrisonForm,
  req: Request,
  prisonLookup: (id: string) => Promise<Prison | undefined>
): Promise<string> {
  const errors = await validateAsync(
    form,
    {
      name: ['required', 'between:2,80'],
      id: ['required', 'between:2,6', 'unique-prison-code'],
    },
    {
      'required.id': 'Enter a prison code',
      'between.id': 'Enter a prison code between 2 and 6 characters',
      'required.name': 'Enter a prison name',
      'between.name': 'Enter a prison name between 2 and 80 characters',
      'between.description': 'Enter a prison description between 2 and 200 characters',
    },
    {
      prisonLookup,
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/prison-register/add-new-prison-details'
  }
  return form.completed ? '/prison-register/add-new-prison-summary' : '/prison-register/add-new-prison-address'
}
