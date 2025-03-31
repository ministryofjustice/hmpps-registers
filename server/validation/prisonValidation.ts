// eslint-disable-next-line import/no-named-as-default
import Validator, { ErrorMessages, Rules } from 'validatorjs'
import { Prison } from '../@types/prisonRegister'

type lookupFn<T> = (code: string) => Promise<T | undefined>

export function validateAsync<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages,
  lookups: {
    prisonLookup?: lookupFn<Prison | undefined>
  } = {
    prisonLookup: () => Promise.resolve(undefined),
  },
): Promise<Array<{ text: string; href: string }>> {
  Validator.registerAsync(
    'unique-prison-code',
    async (value, requirment, request, passes) => {
      if (typeof value === 'string' && typeof lookups.prisonLookup === 'function') {
        if (isPrisonCode(value)) {
          const existingPrison = await lookups.prisonLookup(value)
          if (existingPrison) {
            passes(false, `${existingPrison.prisonName} already has that code. Choose another code`)
            return
          }
        }
      }
      passes()
    },
    `The code is already used. Choose another code`,
  )

  const validation = new Validator(form, rules, customMessages)

  return checkErrorsAsync(validation)
}
export function validate<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages,
): Array<{ text: string; href: string }> {
  const validation = new Validator(form, rules, customMessages)

  return checkErrors(validation)
}

const checkErrorsAsync = <T>(validation: Validator.Validator<T>): Promise<Array<{ text: string; href: string }>> => {
  return new Promise(resolve => {
    validation.checkAsync(
      () => {
        resolve([])
      },
      () => {
        resolve(asErrors(validation.errors))
      },
    )
  })
}
const checkErrors = <T>(validation: Validator.Validator<T>): Array<{ text: string; href: string }> => {
  validation.check()
  return asErrors(validation.errors)
}

const isPrisonCode = (code: string) => {
  return new Validator({ code }, { code: 'between:2,6' }).passes()
}

const asErrors = (errors: Validator.Errors) =>
  Object.keys(errors.all()).map(key => {
    const message = errors.first(key) as string
    return { text: message, href: `#${key}` }
  })
