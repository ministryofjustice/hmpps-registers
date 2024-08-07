import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { AddUpdateResponse } from '../../services/prisonRegisterService'
import ControllerHelper from '../utils/controllerHelper'
import { InsertPrison } from '../../@types/prisonRegister'

export default async function validate(
  form: AddNewPrisonForm,
  req: Request,
  addPrisonService: (addPrison: InsertPrison) => Promise<AddUpdateResponse>,
): Promise<string> {
  const errors: Array<{ text?: string; href?: string }> = []

  const response = await addPrisonService(asAddPrison(form))
  if (!response.success) {
    errors.push({ text: response.errorMessage })
  }
  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/prison-register/add-new-prison-summary'
  }
  return '/prison-register/add-new-prison-finished'
}

function asAddPrison(form: AddNewPrisonForm): InsertPrison {
  const genders = ControllerHelper.parseStringArrayFromQuery(form.gender) || []
  return {
    prisonId: form.id as string,
    prisonName: form.name as string,
    male: genders.includes('male'),
    female: genders.includes('female'),
    contracted: form.contracted.includes('yes'),
    lthse: form.lthse.includes('no'),
    active: true,
    prisonTypes: (ControllerHelper.parseStringArrayFromQuery(form.prisonTypes) || []) as InsertPrison['prisonTypes'],
    addresses: [
      {
        addressLine1: form.addressline1,
        addressLine2: form.addressline2,
        town: form.addresstown as string,
        county: form.addresscounty,
        postcode: form.addresspostcode as string,
        country: form.addresscountry as string,
      },
    ],
  }
}
