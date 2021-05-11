import { Request } from 'express'
import type { AmendCourtBuildingForm } from 'forms'
import { Court, CourtBuilding } from '../../@types/courtRegister'
import { validateAsync } from '../../validation/validation'

export default async function validate(
  form: AmendCourtBuildingForm,
  req: Request,
  updateService: (courtBuildingForm: AmendCourtBuildingForm) => Promise<void>,
  courtLookup: (subCode: string) => Promise<Court | undefined>,
  courtBuildingLookup: (subCode: string) => Promise<CourtBuilding | undefined>,
  courtMainBuildingLookup: (courtId: string) => Promise<CourtBuilding | undefined>
): Promise<string> {
  const errors = await validateAsync(
    form,
    {
      buildingname: ['required', 'between:0,50'],
      addressline1: ['required', 'between:0,80'],
      addressline2: 'between:0,80',
      addresstown: ['required', 'between:0,80'],
      addresscounty: ['required', 'between:0,80'],
      addresspostcode: ['required', 'postcode', 'between:0,8'],
      addresscountry: 'required',
      subCode: ['between:0,6', `unique-subcode:${form.id}`, `single-main-building:${form.courtId}`],
    },
    {
      'required.buildingname': 'Enter the building name',
      'required.addressline1': 'Enter the first line of the address',
      'required.addresstown': 'Enter the town or city',
      'required.addresscounty': 'Enter the county',
      'required.addresspostcode': 'Enter the postcode, like AA11AA',
      'required.addresscountry': 'Select the country',
      'between.subCode': 'Enter a unique building code not greater than 6 characters',
      'between.buildingname': 'Enter the building name not greater than 50 characters',
      'between.addressline1': 'Enter the first line of the address not greater than 80 characters',
      'between.addressline2': 'Enter the second line of the address not greater than 80 characters',
      'between.addresstown': 'Enter the town or city not greater than 80 characters',
      'between.addresscounty': 'Enter the county not greater than 80 characters',
      'between.addresspostcode': 'Enter the postcode, like AA11AA',
    },
    {
      courtLookup,
      courtBuildingLookup,
      courtMainBuildingLookup,
    }
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/amend-court-building'
  }

  await updateService(form)

  return `/court-register/details?id=${form.courtId}&action=UPDATED`
}
