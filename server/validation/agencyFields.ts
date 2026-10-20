import { CodeDescription } from '../@types/prisonRegister'
import { validate } from './agencyValidation'

export type FormError = { href: string; text: string }

export function validateNameDescription(
  name: string,
  description: string,
  options: { nameField: string; nameLabel: string; nameMax: number; descriptionMax: number },
): FormError[] {
  const { nameField, nameLabel, nameMax, descriptionMax } = options
  return validate(
    { [nameField]: name, description },
    { [nameField]: ['required', `max:${nameMax}`], description: [`max:${descriptionMax}`] },
    {
      [`required.${nameField}`]: `Enter a ${nameLabel.toLowerCase()}`,
      [`max.${nameField}`]: `${nameLabel} must be ${nameMax} characters or fewer`,
      'max.description': `Description must be ${descriptionMax} characters or fewer`,
    },
  )
}

export async function validateReference(
  code: string | undefined,
  description: string | undefined,
  field: string,
  label: string,
  getItems: () => Promise<CodeDescription[]>,
): Promise<{ errors: FormError[]; selected?: CodeDescription }> {
  if (!code && !description) return { errors: [] }
  const selected = code ? (await getItems()).find(item => item.code === code) : undefined
  return selected
    ? { errors: [], selected }
    : { errors: [{ href: `#${field}`, text: `Select a valid ${label} from the suggestions` }] }
}
