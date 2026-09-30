// eslint-disable-next-line import/no-named-as-default
import Validator, { ErrorMessages, Rules } from 'validatorjs'

export function validateAsync<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages,
): Promise<Array<{ text: string; href: string }>> {
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

const asErrors = (errors: Validator.Errors) =>
  Object.keys(errors.all()).map(key => {
    const message = errors.first(key) as string
    return { text: message, href: `#${key}` }
  })
