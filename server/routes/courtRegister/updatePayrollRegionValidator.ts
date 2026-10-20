import { Request } from 'express'
import type { UpdatePayrollRegionForm } from 'agencyForms'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export default async function validate(
  form: UpdatePayrollRegionForm,
  req: Request,
  getPayrollRegions: () => Promise<CodeDescription[]>,
  updatePayrollRegion: (payrollRegionCode?: string) => Promise<CourtMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const payrollRegionCode = form.payrollRegionCode || undefined
  if (
    payrollRegionCode &&
    !(await getPayrollRegions()).some(payrollRegion => payrollRegion.code === payrollRegionCode)
  ) {
    req.flash('errors', [{ href: '#payrollRegion', text: 'Select a valid payroll region from the suggestions' }])
    return `/court-register/payroll-region/update?id=${id}`
  }
  const result = await updatePayrollRegion(payrollRegionCode)
  if (result.success === false) {
    req.flash('errors', [{ href: '#payrollRegion', text: result.userMessage }])
    return `/court-register/payroll-region/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
