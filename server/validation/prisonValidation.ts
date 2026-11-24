import { Prison } from '../@types/prisonRegister'
import { type ErrorMessages, type FormError, type Rules, validateForm, validateFormAsync } from './validator'

type lookupFn<T> = (code: string) => Promise<T | undefined>

const isPrisonCode = (code: string) => code.length >= 2 && code.length <= 6

export function validateAsync(
  form: object | undefined,
  rules: Rules,
  customMessages: ErrorMessages,
  lookups: {
    prisonLookup?: lookupFn<Prison | undefined>
  } = {
    prisonLookup: () => Promise.resolve(undefined),
  },
): Promise<FormError[]> {
  return validateFormAsync(form, rules, customMessages, {
    'unique-prison-code': {
      check: async value => {
        if (typeof value === 'string' && typeof lookups.prisonLookup === 'function' && isPrisonCode(value)) {
          const existingPrison = await lookups.prisonLookup(value)
          if (existingPrison) return `${existingPrison.prisonName} already has that code. Choose another code`
        }
        return true
      },
      message: 'The code is already used. Choose another code',
    },
  })
}

export function validate(form: object | undefined, rules: Rules, customMessages: ErrorMessages): FormError[] {
  return validateForm(form, rules, customMessages)
}
