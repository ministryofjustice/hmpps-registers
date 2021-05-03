import { Request } from 'express'
import type { AmendCourtBuildingForm } from 'forms'
import { Court, CourtBuilding } from '../../@types/courtRegister'
import { validateAsync } from '../../validation/validation'

export default async function validate(
  form: AmendCourtBuildingForm,
  req: Request,
  updateService: (courtBuildingForm: AmendCourtBuildingForm) => Promise<void>,
  courtLookup: (subCode: string) => Promise<Court | undefined>,
  courtBuildingLookup: (subCode: string) => Promise<CourtBuilding | undefined>
): Promise<string> {
  const errors = await validateAsync(
    form,
    {
      buildingname: 'required',
      addressline1: 'required',
      addresstown: 'required',
      addresscounty: 'required',
      addresspostcode: ['required', 'postcode'],
      addresscountry: 'required',
      subCode: ['between:0,6', `unique-subcode:${form.id}`],
    },
    {
      'required.buildingname': 'Enter the building name',
      'required.addressline1': 'Enter the first line of the address',
      'required.addresstown': 'Enter the town or city',
      'required.addresscounty': 'Enter the county',
      'required.addresspostcode': 'Enter the postcode, like AA11AA',
      'required.addresscountry': 'Select the country',
      'between.subCode': 'Enter a unique building code not greater than 6 characters',
    },
    {
      courtLookup,
      courtBuildingLookup,
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/amend-court-building'
  }

  await updateService(form)

  return `/court-register/details?id=${form.courtId}&action=UPDATED`
}
