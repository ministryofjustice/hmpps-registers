import Validator, { ErrorMessages, Rules } from 'validatorjs'

Validator.register(
  'postcode',
  value => {
    if (typeof value === 'string') {
      return Boolean(
        value.replace(/[\s.,/=\-_`()]/g, '').match(/^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/i)
      ).valueOf()
    }
    return false
  },
  'Enter a real postcode, like AA11AA'
)

export function validate<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages
): Array<{ text: string; href: string }> {
  const validation = new Validator(form, rules, customMessages)

  return checkErrors(validation)
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
