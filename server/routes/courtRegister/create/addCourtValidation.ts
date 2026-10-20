import { validate } from '../../../validation/agencyValidation'
import HMPPSAgencyRegisterApi, { Context } from '../../../services/hmppsAgencyRegisterApi'
import { allCourtTypes } from '../courtData'
import { isAccessibleAccessOption } from '../accessibleAccessData'
import { AddCourtJourney, CourtStep, isReferenceStep, referenceSteps } from './addCourtFlowControl'
import { validateNameDescription, validateReference } from '../../../validation/agencyFields'
import courtNameDescriptionRules from '../courtValidationRules'

export type CourtFormError = { href: string; text: string }

export default async function validateCourtStep(
  step: CourtStep,
  journey: AddCourtJourney,
  service: HMPPSAgencyRegisterApi,
  context: Context,
): Promise<CourtFormError[]> {
  const { form } = journey
  if (isReferenceStep(step)) {
    const { field, label, service: serviceMethod } = referenceSteps[step]
    const code = form[`${field}Code`]
    const { errors, selected } = await validateReference(code, form[`${field}Description`], field, label, () =>
      service[serviceMethod](context),
    )
    if (selected) form[`${field}Description`] = selected.description
    return errors
  }
  switch (step) {
    case 'details': {
      const errors = validate(
        form,
        {
          courtId: ['required', 'between:2,6', 'alpha_num'],
        },
        {
          'required.courtId': 'Enter a court ID',
          'between.courtId': 'Court ID must be between 2 and 6 characters',
          'alpha_num.courtId': 'Court ID must contain only letters and numbers',
        },
      )
      errors.push(
        ...validateNameDescription(form.courtName, form.description, {
          ...courtNameDescriptionRules,
          nameField: 'courtName',
          nameLabel: 'Court name',
        }),
      )
      if (errors.length === 0) {
        const agency = await service.isAgencyIdUsed(context, form.courtId)
        if (agency) {
          errors.push({ href: '#courtId', text: `This court ID is already used by ${agency.name}` })
        }
      }
      return errors
    }
    case 'court-type':
      return validate(
        form,
        { courtType: ['required', { in: allCourtTypes.map(type => type.code) }] },
        { 'required.courtType': 'Select a court type', 'in.courtType': 'Select a valid court type' },
      )
    case 'accessible-access':
      if (!form.accessibleAccess) {
        return [{ href: '#accessibleAccess', text: 'Select an accessible access option' }]
      }
      return isAccessibleAccessOption(form.accessibleAccess)
        ? []
        : [{ href: '#accessibleAccess', text: 'Select a valid accessible access option' }]
    case 'cjit-code':
      return validate(form, { cjitCode: ['max:7'] }, { 'max.cjitCode': 'CJIT code must be 7 characters or fewer' })
    default:
      throw new Error(`Unknown court creation step: ${step}`)
  }
}
