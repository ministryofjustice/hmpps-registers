import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import { AddHospitalJourney, HospitalStep, isReferenceStep, referenceSteps } from './addHospitalFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import hospitalNameDescriptionRules from '../hospitalValidationRules'

export type HospitalFormError = { href: string; text: string }

export default async function validateHospitalStep(
  step: HospitalStep,
  journey: AddHospitalJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<HospitalFormError[]> {
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
        { hospitalId: ['required', 'between:2,6', 'alpha_num'] },
        {
          'required.hospitalId': 'Enter a hospital ID',
          'between.hospitalId': 'Hospital ID must be between 2 and 6 characters',
          'alpha_num.hospitalId': 'Hospital ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.hospitalName, form.description, {
          ...hospitalNameDescriptionRules,
          nameField: 'hospitalName',
          nameLabel: 'Hospital name',
        }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.hospitalId)
        if (agency) {
          errors.push({ href: '#hospitalId', text: `This hospital ID is already used by ${agency.name}` })
        }
      }
      return errors
    }
    case 'high-security':
      return form.highSecurity === 'true' || form.highSecurity === 'false'
        ? []
        : [{ href: '#highSecurity', text: 'Select whether the hospital is high security' }]
    case 'cjit-code':
      return validate(form, { cjitCode: ['max:7'] }, { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' })
    default:
      throw new Error(`Unknown hospital creation step: ${step}`)
  }
}
