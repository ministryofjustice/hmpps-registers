import { Request } from 'express'
import type { UpdatePayrollRegionForm } from 'agencyForms'
import { validateReference } from '../../validation/agencyFields'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdatePayrollRegionForm,
  req: Request,
  getPayrollRegions: () => Promise<CodeDescription[]>,
  updatePayrollRegion: (payrollRegionCode?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const payrollRegionCode = form.payrollRegionCode || undefined
  const { errors, selected } = await validateReference(
    payrollRegionCode,
    form.payrollRegionDescription,
    'payrollRegion',
    'payroll region',
    getPayrollRegions,
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/payroll-region/update?id=${id}`
  }
  const result = await updatePayrollRegion(payrollRegionCode)
  if (result.success === false) {
    if (selected) req.session.updatePayrollRegionForm = { ...form, payrollRegionDescription: selected.description }
    req.flash('errors', [{ href: '#payrollRegion', text: result.userMessage }])
    return `/court-register/payroll-region/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
