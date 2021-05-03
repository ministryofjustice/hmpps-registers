import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { Court } from '../../@types/courtRegister'
import { validateAsync } from '../../validation/validation'

export default async function validate(
  form: AddNewCourtForm,
  req: Request,
  courtLookup: (id: string) => Promise<Court | undefined>
): Promise<string> {
  const errors = await validateAsync(
    form,
    {
      name: ['required', 'between:2,200'],
      id: ['required', 'between:2,12', 'unique-court-code'],
      type: 'required',
    },
    {
      'required.name': 'Enter a court name',
      'between.name': 'Enter a court name between 2 and 200 characters',
      'required.id': 'Enter a court code',
      'between.id': 'Enter a court code between 2 and 12 characters',
      'required.type': 'Select a court type',
    },
    {
      courtLookup,
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-details'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-building'
}
