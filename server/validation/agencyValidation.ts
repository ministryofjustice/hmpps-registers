import { type ErrorMessages, type FormError, type Rules, validateForm, validateFormAsync } from './validator'

export function validateAsync(
  form: object | undefined,
  rules: Rules,
  customMessages: ErrorMessages,
): Promise<FormError[]> {
  return validateFormAsync(form, rules, customMessages)
}

export function validate(form: object | undefined, rules: Rules, customMessages: ErrorMessages): FormError[] {
  return validateForm(form, rules, customMessages)
}
