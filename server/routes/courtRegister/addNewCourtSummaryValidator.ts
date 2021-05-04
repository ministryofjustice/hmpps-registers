import { Request } from 'express'
import type { AddNewCourtForm } from 'forms'
import { InsertCourtBuildingContact } from '../../@types/courtRegister'
import { AddCourt, AddUpdateResponse } from '../../services/courtRegisterService'

export default async function validate(
  form: AddNewCourtForm,
  req: Request,
  addCourtService: (addCourt: AddCourt) => Promise<AddUpdateResponse>
): Promise<string> {
  const errors: Array<{ text?: string; href?: string }> = []

  const response = await addCourtService(asAddCourt(form))
  if (!response.success) {
    errors.push({ text: response.errorMessage })
  }
  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/court-register/add-new-court-summary'
  }
  return '/court-register/add-new-court-finished'
}

function asAddCourt(form: AddNewCourtForm): AddCourt {
  const contacts: InsertCourtBuildingContact[] = [
    {
      type: 'TEL',
      detail: form.telephonenumber as string,
    },
  ]

  const addCourt: AddCourt = {
    court: {
      courtId: form.id as string,
      courtName: form.name as string,
      courtType: form.type as string,
      active: true,
    },
    building: {
      buildingName: form.buildingname,
      street: form.addressline1,
      town: form.addresstown,
      postcode: form.addresspostcode,
      county: form.addresscounty,
      country: form.addresscountry,
    },
    contacts,
  }

  // add optional fields
  if (form.faxnumber) {
    addCourt.contacts.push({ type: 'FAX', detail: form.faxnumber })
  }
  if (form.description) {
    addCourt.court.courtDescription = form.description
  }
  if (form.addressline2) {
    addCourt.building.locality = form.addressline2
  }
  return addCourt
}
