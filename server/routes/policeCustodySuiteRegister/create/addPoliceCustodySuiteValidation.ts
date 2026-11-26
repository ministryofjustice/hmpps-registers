import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import {
  AddPoliceCustodySuiteJourney,
  PoliceCustodySuiteStep,
  isReferenceStep,
  referenceSteps,
} from './addPoliceCustodySuiteFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import policeCustodySuiteNameDescriptionRules from '../policeCustodySuiteValidationRules'

export type PoliceCustodySuiteFormError = { href: string; text: string }

export default async function validatePoliceCustodySuiteStep(
  step: PoliceCustodySuiteStep,
  journey: AddPoliceCustodySuiteJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<PoliceCustodySuiteFormError[]> {
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
        { policeCustodySuiteId: ['required', 'between:2,6', 'alpha_num'] },
        {
          'required.policeCustodySuiteId': 'Enter a police custody suite ID',
          'between.policeCustodySuiteId': 'Police custody suite ID must be between 2 and 6 characters',
          'alpha_num.policeCustodySuiteId': 'Police custody suite ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.policeCustodySuiteName, form.description, {
          ...policeCustodySuiteNameDescriptionRules,
          nameField: 'policeCustodySuiteName',
          nameLabel: 'Police custody suite name',
        }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.policeCustodySuiteId)
        if (agency) {
          errors.push({
            href: '#policeCustodySuiteId',
            text: `This police custody suite ID is already used by ${agency.name}`,
          })
        }
      }
      return errors
    }
    case 'cjit-code':
      return validate(form, { cjitCode: ['max:7'] }, { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' })
    default:
      throw new Error(`Unknown police custody suite creation step: ${step}`)
  }
}
