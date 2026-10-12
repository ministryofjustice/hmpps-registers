import type { AddPhoneNumberForm } from 'agencyForms'
import { validateAsync } from './agencyValidation'

export default function validatePhoneNumber(form: AddPhoneNumberForm): Promise<Array<{ text: string; href: string }>> {
  return validateAsync(
    form,
    {
      phoneNumber: ['required', 'regex:/^[0-9 +\\-]+$/'],
    },
    {
      'required.phoneNumber': 'Enter a phone number',
      'regex.phoneNumber': 'Enter a phone number using only numbers, spaces, plus signs and dashes',
    },
  )
}
