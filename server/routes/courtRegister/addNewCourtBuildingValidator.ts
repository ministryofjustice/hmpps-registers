import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'

function isBlank(text: string) {
  return text === null || text.trim().length === 0
}

export default function validate(form: AddNewCourtForm, req: Request): string {
  const errors: Array<{ text: string; href: string }> = []

  if (isBlank(form.buildingname)) {
    errors.push({ text: 'Enter the building name', href: '#buildingname' })
  }

  if (isBlank(form.addressline1)) {
    errors.push({ text: 'Enter the first line of the address', href: '#addressline1' })
  }

  if (isBlank(form.addresstown)) {
    errors.push({ text: 'Enter the town or city', href: '#addresstown' })
  }

  if (isBlank(form.addresscounty)) {
    errors.push({ text: 'Enter the county', href: '#addresscounty' })
  }

  if (isBlank(form.addresspostcode)) {
    errors.push({ text: 'Enter the postcode, like AA11AA', href: '#addresspostcode' })
  }

  if (isBlank(form.addresscountry)) {
    errors.push({ text: 'Enter the country, like England', href: '#addresscountry' })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-building'
  }
  return form.completed ? '/court-register/add-new-court-summary' : '/court-register/add-new-court-contact-details'
}
