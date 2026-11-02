import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import {
  AddApprovedPremisesJourney,
  ApprovedPremisesStep,
  isReferenceStep,
  referenceSteps,
} from './addApprovedPremisesFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import { isAccessibleAccessOption } from '../../courtRegister/accessibleAccessData'
import approvedPremisesNameDescriptionRules from '../approvedPremisesValidationRules'

export type ApprovedPremisesFormError = { href: string; text: string }

export default async function validateApprovedPremisesStep(
  step: ApprovedPremisesStep,
  journey: AddApprovedPremisesJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<ApprovedPremisesFormError[]> {
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
        { approvedPremisesId: ['required', 'between:2,6', 'alpha_num'] },
        {
          'required.approvedPremisesId': 'Enter an approved premises ID',
          'between.approvedPremisesId': 'Approved premises ID must be between 2 and 6 characters',
          'alpha_num.approvedPremisesId': 'Approved premises ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.approvedPremisesName, form.description, {
          ...approvedPremisesNameDescriptionRules,
          nameField: 'approvedPremisesName',
          nameLabel: 'Approved premises name',
        }),
      )
      errors.push(
        ...validate(form, { contact: ['max:80'] }, { 'max.contact': 'Contact must be 80 characters or fewer' }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.approvedPremisesId)
        if (agency) {
          errors.push({
            href: '#approvedPremisesId',
            text: `This approved premises ID is already used by ${agency.name}`,
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
      throw new Error(`Unknown approved premises creation step: ${step}`)
  }
}
