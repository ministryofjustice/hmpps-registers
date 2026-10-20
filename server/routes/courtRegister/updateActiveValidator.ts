import { Request } from 'express'
import { format, isValid, parse } from 'date-fns'
import type { UpdateActiveForm } from 'agencyForms'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export type ActiveUpdate = { active: boolean; inactiveDate?: string }

export default async function validate(
  form: UpdateActiveForm,
  req: Request,
  updateActive: (update: ActiveUpdate) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors: Array<{ href: string; text: string }> = []
  let inactiveDate: string
  if (form.active !== 'true' && form.active !== 'false') {
    errors.push({ href: '#active', text: 'Select active or inactive' })
  } else if (form.active === 'false') {
    const { inactiveDay: day, inactiveMonth: month, inactiveYear: year } = form
    if (!day || !month || !year) {
      errors.push({ href: '#inactiveDate', text: 'Enter the date deactivated, including a day, month and year' })
    } else {
      const date = parse(`${day} ${month} ${year}`, 'd M yyyy', new Date())
      if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year) || !isValid(date)) {
        errors.push({ href: '#inactiveDate', text: 'Date deactivated must be a real date' })
      } else {
        inactiveDate = format(date, 'yyyy-MM-dd')
      }
    }
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/court-register/active/update?id=${id}`
  }
  const result = await updateActive(form.active === 'true' ? { active: true } : { active: false, inactiveDate })
  if (result.success === false) {
    req.flash('errors', [{ href: '#active', text: result.userMessage }])
    return `/court-register/active/update?id=${id}`
  }
  return `/court-register/details?id=${id}&action=UPDATED`
}
