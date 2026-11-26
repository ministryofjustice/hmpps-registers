/**
 * Checks a form against rules such as 'required|between:3,80', ['required', 'max:7'] or ['required', { in: codes }].
 *
 * This replaced the unmaintained validatorjs package. It supports only the rules this service uses, and
 * follows validatorjs's behaviour for them so that error messages are unchanged:
 * - rules other than required and required_if are skipped when the value is empty
 *   (undefined, null, or only white space), unless the value is a list
 * - each field reports the first rule it fails
 * - a message is found by looking for '<rule>.<field>', then '<rule>', in the form's messages
 */

export type Rules = Record<string, string | Array<string | Record<string, string | string[]>>>
export type ErrorMessages = Record<string, string>
export type FormError = { text: string; href: string }

/** Resolves true if the value passes, false to fail with the rule's usual message, or a message to fail with */
export type AsyncRule = (value: unknown) => Promise<boolean | string>

type Parameter = string | string[] | undefined
type Rule = { name: string; parameter?: Parameter }
type FieldRules = { field: string; rules: Rule[] }
type RuleCheck = (value: unknown, parameter: Parameter, form: object) => boolean

const hasOwn = (object: object, key: string): boolean => Object.prototype.hasOwnProperty.call(object, key)

const isPresent = (value: unknown): boolean =>
  value !== undefined && value !== null && String(value).replace(/\s/g, '').length > 0

/** Length of text, number of items in a list, or a number's value */
const sizeOf = (value: unknown): number => {
  if (Array.isArray(value)) return value.length
  if (typeof value === 'number') return value
  return (value as { length?: number }).length ?? NaN
}

const parametersOf = (parameter: Parameter): string[] => {
  if (Array.isArray(parameter)) return parameter
  return parameter === undefined ? [] : parameter.split(',')
}

const fieldValue = (form: object, field: string): unknown =>
  hasOwn(form, field) ? (form as Record<string, unknown>)[field] : undefined

const emailPattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
// also allows accented characters and longer domain names
const internationalEmailPattern =
  // eslint-disable-next-line no-control-regex
  /^((?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]|[^\u0000-\u007F])+@(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?(?:\.(?:[a-zA-Z0-9]|[^\u0000-\u007F])(?:(?:[a-zA-Z0-9-]|[^\u0000-\u007F]){0,61}(?:[a-zA-Z0-9]|[^\u0000-\u007F]))?)+)*$/

const postcodePattern = /^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/i

const ruleChecks: Record<string, RuleCheck> = {
  required: value => isPresent(value),

  /** 'required_if:otherField,value' - required when the other field has that value */
  required_if: (value, parameter, form) => {
    const [otherField, otherValue] = parametersOf(parameter)
    return fieldValue(form, otherField) === otherValue ? isPresent(value) : true
  },

  /** 'between:min,max' */
  between: (value, parameter) => {
    const [min, max] = parametersOf(parameter).map(limit => Number.parseFloat(limit))
    const size = sizeOf(value)
    return size >= min && size <= max
  },

  /** 'max:n' */
  max: (value, parameter) => sizeOf(value) <= Number(parameter),

  email: value => {
    const text = String(value)
    return emailPattern.test(text) || internationalEmailPattern.test(text)
  },

  alpha_num: value => /^[a-zA-Z0-9]+$/.test(String(value)),

  /** 'regex:/pattern/flags' - flags may be any of g, i and m */
  regex: (value, parameter) => {
    const flagsPattern = /[g|i|m]{1,3}$/
    const text = String(parameter)
    const flags = text.match(flagsPattern)?.[0] ?? ''
    return new RegExp(text.replace(flagsPattern, '').slice(1, -1), flags).test(String(value))
  },

  /** 'in:a,b,c' or { in: [a, b, c] } - one of the listed values; every item must be listed when the value is a list */
  in: (value, parameter) => {
    if (!value) return true
    const allowed = parametersOf(parameter)
    if (Array.isArray(value)) return value.every(item => allowed.includes(item))
    return allowed.includes(String(value))
  },

  /** UK postcode, ignoring spaces and common punctuation */
  postcode: value => typeof value === 'string' && postcodePattern.test(value.replace(/[\s.,/=\-_`()]/g, '')),
}

/** Rules that are checked even when the value is empty */
const alwaysChecked = ['required', 'required_if']

/** Messages for rules that a form does not give its own message for */
const defaultMessages: ErrorMessages = {
  postcode: 'Enter a real postcode, like AA11AA',
}

const parseRule = (rule: string | Record<string, string | string[]>): Rule[] => {
  if (typeof rule !== 'string') return Object.entries(rule).map(([name, parameter]) => ({ name, parameter }))
  const [name, ...parameter] = rule.split(':')
  return [parameter.length > 0 ? { name, parameter: parameter.join(':') } : { name }]
}

const parseRules = (rules: Rules): FieldRules[] =>
  Object.entries(rules).map(([field, fieldRules]) => ({
    field,
    rules: (typeof fieldRules === 'string' ? fieldRules.split('|') : fieldRules).flatMap(parseRule),
  }))

const shouldCheck = (rule: Rule, value: unknown): boolean =>
  Array.isArray(value) || alwaysChecked.includes(rule.name) || isPresent(value)

const messageFor = (rule: Rule, field: string, messages: ErrorMessages, defaults: ErrorMessages): string => {
  const key = [`${rule.name}.${field}`, rule.name].find(name => hasOwn(messages, name) || hasOwn(defaults, name))
  if (key === undefined) return `The ${field.replace(/[_[]/g, ' ').replace(/]/g, '')} attribute has errors.`
  return hasOwn(messages, key) ? messages[key] : defaults[key]
}

/** The first failure for each field, in the order the fields appear in the rules */
const checkRules = (form: object, fields: FieldRules[], messages: ErrorMessages): Map<string, string> => {
  const failures = new Map<string, string>()
  fields.forEach(({ field, rules }) => {
    const value = fieldValue(form, field)
    rules.forEach(rule => {
      if (!hasOwn(ruleChecks, rule.name)) throw new Error(`Unknown validation rule '${rule.name}'`)
      if (!failures.has(field) && shouldCheck(rule, value) && !ruleChecks[rule.name](value, rule.parameter, form)) {
        failures.set(field, messageFor(rule, field, messages, defaultMessages))
      }
    })
  })
  return failures
}

const asErrors = (failures: Map<string, string>): FormError[] =>
  [...failures].map(([field, text]) => ({ text, href: `#${field}` }))

/** Checks the form and returns an error for each field that fails */
export function validateForm(form: object | undefined, rules: Rules, messages: ErrorMessages): FormError[] {
  return asErrors(checkRules(form ?? {}, parseRules(rules), messages))
}

/**
 * As validateForm, but also runs rules that need to look something up, such as whether a code is already in use.
 * Errors from those rules come after errors from the other rules.
 */
export async function validateFormAsync(
  form: object | undefined,
  rules: Rules,
  messages: ErrorMessages,
  asyncRules: Record<string, { check: AsyncRule; message: string }> = {},
): Promise<FormError[]> {
  const values = form ?? {}
  const isAsync = (rule: Rule) => hasOwn(asyncRules, rule.name)
  const fields = parseRules(rules)

  const lookups = fields.flatMap(({ field, rules: fieldRules }) => {
    const value = fieldValue(values, field)
    return fieldRules
      .filter(rule => isAsync(rule) && shouldCheck(rule, value))
      .map(rule => ({ field, rule, result: asyncRules[rule.name].check(value) }))
  })
  const failures = checkRules(
    values,
    fields.map(({ field, rules: fieldRules }) => ({ field, rules: fieldRules.filter(rule => !isAsync(rule)) })),
    messages,
  )

  const asyncDefaults = Object.fromEntries(Object.entries(asyncRules).map(([name, rule]) => [name, rule.message]))
  const outcomes = await Promise.all(lookups.map(lookup => lookup.result))
  lookups.forEach(({ field, rule }, index) => {
    const outcome = outcomes[index]
    if (outcome !== true && !failures.has(field)) {
      failures.set(field, typeof outcome === 'string' ? outcome : messageFor(rule, field, messages, asyncDefaults))
    }
  })
  return asErrors(failures)
}
