import { Request } from 'express'
import type { UpdateCourtTypeForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import { allCourtTypes } from './courtData'

export default async function validate(
  form: UpdateCourtTypeForm,
  req: Request,
  updateCourtType: (courtTypeCode: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    {
      courtType: ['required', { in: allCourtTypes.map(type => type.code) }],
    },
    {
      'required.courtType': 'Select a court type',
      'in.courtType': 'Select a valid court type',
    },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/court-type/update?id=${id}`
  }

  const result = await updateCourtType(form.courtType)
  if (result.success === false) {
    req.flash('errors', [{ href: '#courtType', text: result.userMessage }])
    return `/court-register/court-type/update?id=${id}`
  }

  return `/court-register/details?id=${id}&action=UPDATED`
}
