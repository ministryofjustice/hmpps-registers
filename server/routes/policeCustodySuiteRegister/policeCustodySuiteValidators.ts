/* eslint-disable no-param-reassign */
import { Request } from 'express'
import { format, isValid, parse } from 'date-fns'
import type {
  AddAddressForm,
  AddEmailAddressForm,
  AddPhoneNumberForm,
  UpdateActiveForm,
  UpdateAddressForm,
  UpdateAreaForm,
  UpdateCjitCodeForm,
  UpdateEmailAddressForm,
  UpdateGeographicalAreaForm,
  UpdateLocalAuthorityForm,
  UpdateNameDescriptionForm,
  UpdatePayrollRegionForm,
  UpdatePhoneNumberForm,
  UpdateRegionForm,
} from 'agencyForms'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'
import type { CodeDescription, PhoneNumber, UpdateAgencyAddress, UpdateEmailAddress } from '../../@types/prisonRegister'
import { validateAsync } from '../../validation/agencyValidation'
import { validateNameDescription, validateReference } from '../../validation/agencyFields'
import validateAddress from '../../validation/addressValidation'
import validatePhoneNumber from '../../validation/phoneNumberValidation'
import policeCustodySuiteNameDescriptionRules from './policeCustodySuiteValidationRules'

type FlashErrors = Array<{ href: string; text: string }>

const policeCustodySuiteId = (req: Request) => (req.query as { id: string }).id
const updatePage = (req: Request, page: string, extra = '') =>
  `/police-custody-suite-register/${page}?id=${policeCustodySuiteId(req)}${extra}`
const detailsPage = (req: Request) =>
  `/police-custody-suite-register/details?id=${policeCustodySuiteId(req)}&action=UPDATED`

const addressFields = (form: AddAddressForm): UpdateAgencyAddress => ({
  addressLine1: form.addressline1,
  addressLine2: form.addressline2,
  town: form.addresstown,
  county: form.addresscounty,
  postcode: form.addresspostcode,
  country: form.addresscountry,
})

async function validateAndSave(
  req: Request,
  page: string,
  errors: FlashErrors,
  errorField: string,
  save: () => Promise<AgencyMutationResponse>,
): Promise<string> {
  if (errors.length > 0) {
    req.flash('errors', errors)
    return page
  }
  const result = await save()
  if (result.success === false) {
    req.flash('errors', [{ href: errorField, text: result.userMessage }])
    return page
  }
  return detailsPage(req)
}

export type PoliceCustodySuiteNameDescription = { name: string; description: string }

export function validateUpdateNameDescription(
  form: UpdateNameDescriptionForm,
  req: Request,
  update: (nameDescription: PoliceCustodySuiteNameDescription) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = validateNameDescription(form.name, form.description, {
    ...policeCustodySuiteNameDescriptionRules,
    nameField: 'name',
    nameLabel: 'Name',
  })
  return validateAndSave(req, updatePage(req, 'name-description/update'), errors, '#name', () =>
    update({ name: form.name, description: form.description ?? '' }),
  )
}

export type PoliceCustodySuiteActiveUpdate = { active: boolean; inactiveDate?: string }

export function validateUpdateActive(
  form: UpdateActiveForm,
  req: Request,
  update: (update: PoliceCustodySuiteActiveUpdate) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors: FlashErrors = []
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
  return validateAndSave(req, updatePage(req, 'active/update'), errors, '#active', () =>
    update(form.active === 'true' ? { active: true } : { active: false, inactiveDate }),
  )
}

export async function validateUpdateCjitCode(
  form: UpdateCjitCodeForm,
  req: Request,
  update: (cjitCode: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = await validateAsync(
    form,
    { cjitCode: ['max:7'] },
    { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' },
  )
  return validateAndSave(req, updatePage(req, 'cjit-code/update'), errors, '#cjitCode', () =>
    update(form.cjitCode ?? ''),
  )
}

type ReferenceConfig<F> = {
  page: string
  field: string
  label: string
  codeOf: (form: F) => string | undefined
  descriptionOf: (form: F) => string | undefined
  withDescription: (form: F, description: string) => F
  keepForm: (req: Request, form: F) => void
}

async function validateUpdateReference<F>(
  config: ReferenceConfig<F>,
  form: F,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const code = config.codeOf(form) || undefined
  const { errors, selected } = await validateReference(
    code,
    config.descriptionOf(form),
    config.field,
    config.label,
    getOptions,
  )
  const page = updatePage(req, config.page)
  if (errors.length > 0) {
    req.flash('errors', errors)
    return page
  }
  const result = await update(code)
  if (result.success === false) {
    if (selected) config.keepForm(req, config.withDescription(form, selected.description))
    req.flash('errors', [{ href: `#${config.field}`, text: result.userMessage }])
    return page
  }
  return detailsPage(req)
}

export const validateUpdateArea = (
  form: UpdateAreaForm,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
) =>
  validateUpdateReference<UpdateAreaForm>(
    {
      page: 'area/update',
      field: 'area',
      label: 'area',
      codeOf: f => f.areaCode,
      descriptionOf: f => f.areaDescription,
      withDescription: (f, areaDescription) => ({ ...f, areaDescription }),
      keepForm: (r, f) => {
        r.session.updateAreaForm = f
      },
    },
    form,
    req,
    getOptions,
    update,
  )

export const validateUpdateRegion = (
  form: UpdateRegionForm,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
) =>
  validateUpdateReference<UpdateRegionForm>(
    {
      page: 'region/update',
      field: 'region',
      label: 'region',
      codeOf: f => f.regionCode,
      descriptionOf: f => f.regionDescription,
      withDescription: (f, regionDescription) => ({ ...f, regionDescription }),
      keepForm: (r, f) => {
        r.session.updateRegionForm = f
      },
    },
    form,
    req,
    getOptions,
    update,
  )

export const validateUpdateGeographicalArea = (
  form: UpdateGeographicalAreaForm,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
) =>
  validateUpdateReference<UpdateGeographicalAreaForm>(
    {
      page: 'geographical-area/update',
      field: 'geographicalArea',
      label: 'geographical area',
      codeOf: f => f.geographicalAreaCode,
      descriptionOf: f => f.geographicalAreaDescription,
      withDescription: (f, geographicalAreaDescription) => ({ ...f, geographicalAreaDescription }),
      keepForm: (r, f) => {
        r.session.updateGeographicalAreaForm = f
      },
    },
    form,
    req,
    getOptions,
    update,
  )

export const validateUpdateLocalAuthority = (
  form: UpdateLocalAuthorityForm,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
) =>
  validateUpdateReference<UpdateLocalAuthorityForm>(
    {
      page: 'local-authority/update',
      field: 'localAuthority',
      label: 'local authority',
      codeOf: f => f.localAuthorityCode,
      descriptionOf: f => f.localAuthorityDescription,
      withDescription: (f, localAuthorityDescription) => ({ ...f, localAuthorityDescription }),
      keepForm: (r, f) => {
        r.session.updateLocalAuthorityForm = f
      },
    },
    form,
    req,
    getOptions,
    update,
  )

export const validateUpdatePayrollRegion = (
  form: UpdatePayrollRegionForm,
  req: Request,
  getOptions: () => Promise<CodeDescription[]>,
  update: (code?: string) => Promise<AgencyMutationResponse>,
) =>
  validateUpdateReference<UpdatePayrollRegionForm>(
    {
      page: 'payroll-region/update',
      field: 'payrollRegion',
      label: 'payroll region',
      codeOf: f => f.payrollRegionCode,
      descriptionOf: f => f.payrollRegionDescription,
      withDescription: (f, payrollRegionDescription) => ({ ...f, payrollRegionDescription }),
      keepForm: (r, f) => {
        r.session.updatePayrollRegionForm = f
      },
    },
    form,
    req,
    getOptions,
    update,
  )

export function validateAddAddress(
  form: AddAddressForm,
  req: Request,
  add: (address: UpdateAgencyAddress) => Promise<AgencyMutationResponse>,
): Promise<string> {
  return validateAndSave(req, updatePage(req, 'address/create'), validateAddress(form), '#addressline1', () =>
    add(addressFields(form)),
  )
}

export function validateUpdateAddress(
  form: UpdateAddressForm,
  req: Request,
  update: (address: UpdateAgencyAddress) => Promise<AgencyMutationResponse>,
): Promise<string> {
  return validateAndSave(
    req,
    updatePage(req, 'address/update', `&addressId=${form.addressId}`),
    validateAddress(form),
    '#addressline1',
    () => update(addressFields(form)),
  )
}

export async function validateAddPhoneNumber(
  form: AddPhoneNumberForm,
  req: Request,
  add: (phoneNumber: PhoneNumber) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = await validatePhoneNumber(form)
  return validateAndSave(req, updatePage(req, 'phone/create'), errors, '#phoneNumber', () =>
    add({ number: form.phoneNumber }),
  )
}

export async function validateUpdatePhoneNumber(
  form: UpdatePhoneNumberForm,
  req: Request,
  update: (phoneNumber: PhoneNumber) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = await validatePhoneNumber(form)
  return validateAndSave(req, updatePage(req, 'phone/update', `&phoneId=${form.phoneId}`), errors, '#phoneNumber', () =>
    update({ number: form.phoneNumber }),
  )
}

const validateEmailAddress = (form: AddEmailAddressForm | UpdateEmailAddressForm) =>
  validateAsync(
    form,
    { emailAddress: ['required', 'email'] },
    {
      'required.emailAddress': 'Enter an email address',
      'email.emailAddress': 'Enter a valid email address',
    },
  )

export async function validateAddEmailAddress(
  form: AddEmailAddressForm,
  req: Request,
  add: (emailAddress: UpdateEmailAddress) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = await validateEmailAddress(form)
  return validateAndSave(req, updatePage(req, 'email/create'), errors, '#emailAddress', () =>
    add({ address: form.emailAddress }),
  )
}

export async function validateUpdateEmailAddress(
  form: UpdateEmailAddressForm,
  req: Request,
  update: (emailAddress: UpdateEmailAddress) => Promise<AgencyMutationResponse>,
): Promise<string> {
  const errors = await validateEmailAddress(form)
  return validateAndSave(
    req,
    updatePage(req, 'email/update', `&emailId=${form.emailId}`),
    errors,
    '#emailAddress',
    () => update({ address: form.emailAddress }),
  )
}
