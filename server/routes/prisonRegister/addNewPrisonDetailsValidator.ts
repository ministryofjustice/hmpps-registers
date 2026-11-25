import { Request } from 'express'
import type { AddNewPrisonForm } from 'prisonForms'
import { Prison, PrisonOperator } from '../../@types/prisonRegister'
import { validateAsync } from '../../validation/prisonValidation'
import { DEFAULT_OPERATOR_NAME } from './prisonDetailFields'

/** The operator to save: the one chosen for a contracted prison, or PSP for a public sector prison */
export function prisonOperatorFor(form: AddNewPrisonForm, operators: PrisonOperator[]): PrisonOperator | undefined {
  return form.contracted === 'yes'
    ? operators.find(operator => String(operator.id) === form.operator)
    : operators.find(operator => operator.name === DEFAULT_OPERATOR_NAME)
}

export default async function validate(
  form: AddNewPrisonForm,
  req: Request,
  prisonLookup: (id: string) => Promise<Prison | undefined>,
  operators: PrisonOperator[] = [],
): Promise<string> {
  const errors = await validateAsync(
    form,
    {
      // the same limits as the API
      name: ['required', 'between:3,40'],
      prisonNameInWelsh: ['between:3,80'],
      id: ['required', 'between:3,6', 'unique-prison-code'],
      contracted: ['required'],
      operator: [`required_if:contracted,yes`, { in: operators.map(operator => String(operator.id)) }],
    },
    {
      'required.id': 'Enter a prison code',
      'between.id': 'Enter a prison code between 3 and 6 characters',
      'required.name': 'Enter a prison name',
      'between.name': 'Enter a prison name between 3 and 40 characters',
      'between.prisonNameInWelsh': 'Enter a prison name in Welsh between 3 and 80 characters',
      'between.description': 'Enter a prison description between 2 and 200 characters',
      'required.contracted': 'State whether prison is contracted',
      'required_if.operator': 'Select the operator of the prison',
      'in.operator': 'Select the operator of the prison',
    },
    {
      prisonLookup,
    },
  )

  if (errors.length > 0) {
    req.flash('errors', errors)
    return '/prison-register/add-new-prison-details'
  }
  return form.completed ? '/prison-register/add-new-prison-summary' : '/prison-register/add-new-prison-address'
}
