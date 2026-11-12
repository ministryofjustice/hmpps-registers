import type { UpdatePrisonDetailForm } from 'prisonForms'
import type { Prison, UpdatePrison } from '../../@types/prisonRegister'
import ControllerHelper from '../utils/controllerHelper'

export type PrisonDetailField = {
  field: string
  label: string
  path: string
  rules: Record<string, string>
  messages: Record<string, string>
  initialForm: (prison: Prison) => UpdatePrisonDetailForm
  apply: (update: UpdatePrison, form: UpdatePrisonDetailForm) => UpdatePrison
}

const toArray = (value?: string | string[]): string[] => ControllerHelper.parseStringArrayFromQuery(value) || []

const prisonDetailFields: PrisonDetailField[] = [
  {
    field: 'name',
    label: 'name',
    path: 'name',
    rules: { name: 'required|between:3,80' },
    messages: {
      'required.name': 'Enter a prison name',
      'between.name': 'Enter a prison name between 3 and 80 characters',
    },
    initialForm: prison => ({ name: prison.prisonName }),
    apply: (update, form) => ({ ...update, prisonName: form.name }),
  },
  {
    field: 'prisonNameInWelsh',
    label: 'Welsh name',
    path: 'welsh-name',
    rules: { prisonNameInWelsh: 'between:3,80' },
    messages: { 'between.prisonNameInWelsh': 'Enter a prison name in Welsh between 3 and 80 characters' },
    initialForm: prison => ({ prisonNameInWelsh: prison.prisonNameInWelsh ?? '' }),
    apply: (update, form) => ({ ...update, prisonNameInWelsh: form.prisonNameInWelsh || null }),
  },
  {
    field: 'gender',
    label: 'gender',
    path: 'gender',
    rules: {},
    messages: {},
    initialForm: prison => ({ gender: [...(prison.male ? ['male'] : []), ...(prison.female ? ['female'] : [])] }),
    apply: (update, form) => ({
      ...update,
      male: toArray(form.gender).includes('male'),
      female: toArray(form.gender).includes('female'),
    }),
  },
  {
    field: 'prisonTypes',
    label: 'prison types',
    path: 'prison-types',
    rules: {},
    messages: {},
    initialForm: prison => ({ prisonTypes: prison.types.map(type => type.code) }),
    apply: (update, form) => ({
      ...update,
      prisonTypes: toArray(form.prisonTypes) as UpdatePrison['prisonTypes'],
    }),
  },
  {
    field: 'contracted',
    label: 'contracted status',
    path: 'contracted',
    rules: { contracted: 'required|in:yes,no' },
    messages: {
      'required.contracted': 'Select whether the prison is contracted',
      'in.contracted': 'Select whether the prison is contracted',
    },
    initialForm: prison => ({ contracted: prison.contracted ? 'yes' : 'no' }),
    apply: (update, form) => ({ ...update, contracted: form.contracted === 'yes' }),
  },
  {
    field: 'lthse',
    label: 'long term high security estate status',
    path: 'lthse',
    rules: { lthse: 'required|in:yes,no' },
    messages: {
      'required.lthse': 'Select whether the prison is part of the long term high security estate',
      'in.lthse': 'Select whether the prison is part of the long term high security estate',
    },
    initialForm: prison => ({ lthse: prison.lthse ? 'yes' : 'no' }),
    apply: (update, form) => ({ ...update, lthse: form.lthse === 'yes' }),
  },
]

export default prisonDetailFields
