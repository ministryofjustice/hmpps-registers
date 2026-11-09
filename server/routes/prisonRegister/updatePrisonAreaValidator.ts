import { Request } from 'express'
import { validateReference } from '../../validation/agencyFields'
import { validateAsync } from '../../validation/agencyValidation'
import type { CodeDescription } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

export type PrisonReferenceFieldConfig = {
  field: string
  label: string
  sessionKey: string
  path: string
}

const detailsPage = (id: string) => `/prison-register/details?id=${id}&action=UPDATED`

export async function validatePrisonReference(
  config: PrisonReferenceFieldConfig,
  form: Record<string, string | undefined>,
  req: Request,
  getItems: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const { field, label, sessionKey, path } = config
  const code = form[`${field}Code`] || undefined
  const descriptionKey = `${field}Description`
  const { errors, selected } = await validateReference(code, form[descriptionKey], field, label, getItems)
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/prison-register/${path}/update?id=${id}`
  }
  const result = await update(code)
  if (result.success === false) {
    if (selected) {
      ;(req.session as unknown as Record<string, unknown>)[sessionKey] = {
        ...form,
        [descriptionKey]: selected.description,
      }
    }
    req.flash('errors', [{ href: `#${field}`, text: result.userMessage }])
    return `/prison-register/${path}/update?id=${id}`
  }
  return detailsPage(id)
}

export async function validatePrisonCjitCode(
  form: { cjitCode?: string },
  req: Request,
  update: (cjitCode: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id } = req.query as { id: string }
  const errors = await validateAsync(
    form,
    { cjitCode: ['max:7'] },
    { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' },
  )
  if (errors.length > 0) {
    req.flash('errors', errors)
    return `/prison-register/cjit-code/update?id=${id}`
  }
  const result = await update(form.cjitCode ?? '')
  if (result.success === false) {
    req.flash('errors', [{ href: '#cjitCode', text: result.userMessage }])
    return `/prison-register/cjit-code/update?id=${id}`
  }
  return detailsPage(id)
}
