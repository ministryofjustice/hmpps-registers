import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import {
  AddProbationOfficeJourney,
  ProbationOfficeStep,
  isReferenceStep,
  referenceSteps,
} from './addProbationOfficeFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import { isAccessibleAccessOption } from '../../courtRegister/accessibleAccessData'
import probationOfficeNameDescriptionRules from '../probationOfficeValidationRules'

export type ProbationOfficeFormError = { href: string; text: string }

export default async function validateProbationOfficeStep(
  step: ProbationOfficeStep,
  journey: AddProbationOfficeJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<ProbationOfficeFormError[]> {
  const { form } = journey
  if (isReferenceStep(step)) {
    const { field, label, service: serviceMethod } = referenceSteps[step]
    const { errors, selected } = await validateReference(
      form[`${field}Code`],
      form[`${field}Description`],
      field,
      label,
      () => service[serviceMethod](context),
    )
    if (selected) form[`${field}Description`] = selected.description
    return errors
  }
  switch (step) {
    case 'details': {
      const errors = validate(
        form,
        { probationOfficeId: ['required', 'between:2,6', 'alpha_num'] },
        {
          'required.probationOfficeId': 'Enter a probation office ID',
          'between.probationOfficeId': 'Probation office ID must be between 2 and 6 characters',
          'alpha_num.probationOfficeId': 'Probation office ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.probationOfficeName, form.description, {
          ...probationOfficeNameDescriptionRules,
          nameField: 'probationOfficeName',
          nameLabel: 'Probation office name',
        }),
      )
      errors.push(
        ...validate(form, { contact: ['max:80'] }, { 'max.contact': 'Contact must be 80 characters or fewer' }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.probationOfficeId)
        if (agency) {
          errors.push({
            href: '#probationOfficeId',
            text: `This probation office ID is already used by ${agency.name}`,
          })
        }
      }
      return errors
    }
    case 'cjit-code':
      return validate(form, { cjitCode: ['max:7'] }, { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' })
    case 'accessible-access':
      return !form.accessibleAccess || isAccessibleAccessOption(form.accessibleAccess)
        ? []
        : [{ href: '#accessibleAccess', text: 'Select a valid accessible access option' }]
    default:
      throw new Error(`Unknown probation office creation step: ${step}`)
  }
}
