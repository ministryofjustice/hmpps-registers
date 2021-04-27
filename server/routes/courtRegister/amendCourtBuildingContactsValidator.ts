import { Request } from 'express'
import type { AmendCourtBuildingContactsForm } from 'forms'
import { validate as validateSync } from '../../validation/validation'

function toArrayNotation(href: string) {
  /*
  validator returns:
  "contacts.0.number"
  we want:
  "contacts[0][number]"
  as ID
  */
  const parts = href.split(/\./)
  return parts.reduce((acc, text) => `${acc}[${text}]`)
}

function fixupArrayNotation({ text, href }: { text: string; href: string }) {
  return { text, href: toArrayNotation(href) }
}

export default function validate(form: AmendCourtBuildingContactsForm, req: Request): string {
  const errors = validateSync(
    form,
    {
      'contacts.*.number': 'required:true',
    },
    {
      'required.contacts.*.number': 'Enter the number',
    }
  ).map(error => fixupArrayNotation(error))

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/amend-court-building-contacts'
  }
  return `/court-register/details?id=${form.courtId}&action=UPDATED`
}
