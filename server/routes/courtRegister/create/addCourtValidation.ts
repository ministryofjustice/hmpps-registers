import { validate } from '../../../validation/agencyValidation'
import PrisonRegisterService, { Context } from '../../../services/prisonRegisterService'
import { allCourtTypes } from '../courtData'
import { isAccessibleAccessOption } from '../accessibleAccessData'
import { AddCourtJourney, CourtStep, isReferenceStep, referenceSteps } from './addCourtFlowControl'

export type CourtFormError = { href: string; text: string }

export default async function validateCourtStep(
  step: CourtStep,
  journey: AddCourtJourney,
  service: PrisonRegisterService,
  context: Context,
): Promise<CourtFormError[]> {
  const { form } = journey
  if (isReferenceStep(step)) {
    const { field, label, service: serviceMethod } = referenceSteps[step]
    const code = form[`${field}Code`]
    if (!code && !form[`${field}Description`]) return []
    const selected = code ? (await service[serviceMethod](context)).find(item => item.code === code) : undefined
    if (!selected) return [{ href: `#${field}`, text: `Select a valid ${label} from the suggestions` }]
    form[`${field}Description`] = selected.description
    return []
  }
  switch (step) {
    case 'details': {
      const errors = validate(
        form,
        {
          courtId: ['required', 'between:2,6', 'alpha_num'],
          courtName: ['required', 'max:40'],
          description: ['max:3000'],
        },
        {
          'required.courtId': 'Enter a court ID',
          'between.courtId': 'Court ID must be between 2 and 6 characters',
          'alpha_num.courtId': 'Court ID must contain only letters and numbers',
          'required.courtName': 'Enter a court name',
          'max.courtName': 'Court name must be 40 characters or fewer',
          'max.description': 'Description must be 3000 characters or fewer',
        },
      )
      if (errors.length === 0 && (await service.findCourt(context, form.courtId))) {
        errors.push({ href: '#courtId', text: 'A court with this ID already exists' })
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
