import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import { AddOtherAgencyJourney, OtherAgencyStep, isReferenceStep, referenceSteps } from './addOtherAgencyFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import { otherAgencyTypes } from '../otherAgencyData'
import { isAccessibleAccessOption } from '../../courtRegister/accessibleAccessData'
import agencyNameDescriptionRules from '../otherAgencyValidationRules'

export type OtherAgencyFormError = { href: string; text: string }

export default async function validateOtherAgencyStep(
  step: OtherAgencyStep,
  journey: AddOtherAgencyJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<OtherAgencyFormError[]> {
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
        { agencyId: ['required', 'between:2,6', 'alpha_num'] },
        {
          'required.agencyId': 'Enter an agency ID',
          'between.agencyId': 'Agency ID must be between 2 and 6 characters',
          'alpha_num.agencyId': 'Agency ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.agencyName, form.description, {
          ...agencyNameDescriptionRules,
          nameField: 'agencyName',
          nameLabel: 'Agency name',
        }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.agencyId)
        if (agency) {
          errors.push({
            href: '#agencyId',
            text: `This agency ID is already used by ${agency.name}`,
          })
        }
      }
      return errors
    }
    case 'agency-type':
      return otherAgencyTypes.some(type => type.value === form.agencyType)
        ? []
        : [{ href: '#agencyType', text: 'Select an agency type' }]
    case 'cjit-code':
      return validate(form, { cjitCode: ['max:7'] }, { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' })
    case 'accessible-access':
      return !form.accessibleAccess || isAccessibleAccessOption(form.accessibleAccess)
        ? []
        : [{ href: '#accessibleAccess', text: 'Select a valid accessible access option' }]
    default:
      throw new Error(`Unknown other agency creation step: ${step}`)
  }
}
