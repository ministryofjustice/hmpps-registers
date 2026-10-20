import { Request } from 'express'
import type { UpdateNameDescriptionForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export type NameDescription = {
  name: string
  description: string
}

export default async function validate(
  form: UpdateNameDescriptionForm,
  req: Request,
  updateNameDescription: (nameDescription: NameDescription) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    {
      name: ['required'],
      description: ['required'],
    },
    {
      'required.name': 'Enter a name',
      'required.description': 'Enter a description',
    },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/name-description/update?id=${id}`
  }

  const result = await updateNameDescription({ name: form.name, description: form.description })
  if (result.success === false) {
    req.flash('errors', [{ href: '#name', text: result.userMessage }])
    return `/court-register/name-description/update?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
