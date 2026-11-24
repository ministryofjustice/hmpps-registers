import { type ErrorMessages, type FormError, type Rules, validateForm } from './validator'

export default function validate(form: object | undefined, rules: Rules, customMessages: ErrorMessages): FormError[] {
  return validateForm(form, rules, customMessages)
}
