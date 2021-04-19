import { Request } from 'express'
import type { AmendCourtBuildingForm } from 'forms'
import { Court, CourtBuilding } from '../../@types/courtRegister'

function isBlank(text: string) {
  return !text || text.trim().length === 0
}

function isValidPostcode(text: string) {
  return text.replace(/[\s.,/=\-_`()]/g, '').match(/^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/)
}

export default async function validate(
  form: AmendCourtBuildingForm,
  req: Request,
  updateService: (courtBuildingForm: AmendCourtBuildingForm) => Promise<void>,
  courtLookup: (subCode: string) => Promise<Court | null>,
  courtBuildingLookup: (subCode: string) => Promise<CourtBuilding | null>
): Promise<string> {
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
  } else if (!isValidPostcode(form.addresspostcode)) {
    errors.push({ text: 'Enter a real postcode, like AA11AA', href: '#addresspostcode' })
  }

  if (isBlank(form.addresscountry)) {
    errors.push({ text: 'Select the country', href: '#addresscountry' })
  }

  if (!isBlank(form.subCode)) {
    const existingCourt = await courtLookup(form.subCode)
    if (existingCourt) {
      errors.push({ text: `${existingCourt.courtName} already has that code. Choose another code`, href: '#subCode' })
    } else {
      const existingCourtBuilding = await courtBuildingLookup(form.subCode)
      if (existingCourtBuilding) {
        if (existingCourtBuilding.id !== Number.parseInt(form.id, 10)) {
          errors.push({
            text: `The court building ${existingCourtBuilding.buildingName} already has that code. Choose another code`,
            href: '#subCode',
          })
        }
      }
    }
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/amend-court-building'
  }

  await updateService(form)

  return `/court-register/details?id=${form.courtId}&action=UPDATED`
}
