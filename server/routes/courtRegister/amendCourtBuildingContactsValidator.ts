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

function notOrphanedContact(contact: { id?: string; type?: string; number?: string }) {
  // a removed contact will only have an ID due to constraints in MOJ "add another" pattern
  // so we have to manually remove these from the form
  return contact.type || contact.number
}

export function amendCourtBuildingContactsFormCloneCleaner(
  form: AmendCourtBuildingContactsForm
): AmendCourtBuildingContactsForm {
  return { ...form, contacts: form.contacts.filter(notOrphanedContact) }
}

export default async function validate(
  form: AmendCourtBuildingContactsForm,
  req: Request,
  updateService: (courtBuildingContactsForm: AmendCourtBuildingContactsForm) => Promise<void>
): Promise<string> {
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

  await updateService(form)

  return `/court-register/details?id=${form.courtId}&action=UPDATED`
}
