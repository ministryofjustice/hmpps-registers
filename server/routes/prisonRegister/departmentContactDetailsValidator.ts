import { Request } from 'express'
import type { DepartmentContactDetailsForm } from 'agencyForms'
import { validateAsync } from '../../validation/agencyValidation'
import type { ContactDetails, DepartmentType } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import { isDepartmentType } from './departmentTypes'

export type DepartmentFormMode = 'create' | 'update'

const isValidWebAddress = (value: string): boolean => {
  try {
    const url = new URL(value)
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0
  } catch {
    return false
  }
}

export const departmentFormUrl = (mode: DepartmentFormMode, prisonId: string, departmentType?: string): string =>
  mode === 'create'
    ? `/prison-register/department/create?id=${prisonId}`
    : `/prison-register/department/update?id=${prisonId}&departmentType=${departmentType}`

export default async function validate(
  form: DepartmentContactDetailsForm,
  req: Request,
  mode: DepartmentFormMode,
  save: (contactDetails: ContactDetails) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const { id, departmentType: queryType } = req.query as { id: string; departmentType?: string }
  const formUrl = departmentFormUrl(mode, id, queryType)
  const type = mode === 'create' ? form.departmentType : queryType

  const errors = await validateAsync(
    form,
    {
      emailAddress: ['email'],
      phoneNumber: ['regex:/^[0-9 +\\-]+$/'],
    },
    {
      'email.emailAddress': 'Enter a valid email address',
      'regex.phoneNumber': 'Enter a phone number using only numbers, spaces, plus signs and dashes',
    },
  )
  if (!isDepartmentType(type)) {
    errors.unshift({
      text: mode === 'create' ? 'Select a department type' : 'Department type is not valid',
      href: '#departmentType',
    })
  }
  if (form.webAddress && !isValidWebAddress(form.webAddress)) {
    errors.push({
      text: 'Enter a valid web address, for example https://www.example.com',
      href: '#webAddress',
    })
  }

  if (errors.length > 0) {
    req.flash('errors', errors)
    return formUrl
  }

  const result = await save({
    type: type as DepartmentType,
    emailAddress: form.emailAddress || null,
    phoneNumber: form.phoneNumber || null,
    webAddress: form.webAddress || null,
  })
  if (result.success === false) {
    req.flash('errors', [{ href: '#emailAddress', text: result.userMessage }])
    return formUrl
  }

  return `/prison-register/details?id=${id}&action=UPDATED`
}
