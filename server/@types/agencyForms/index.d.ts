declare module 'agencyForms' {
  export interface AddPhoneNumberForm {
    phoneNumber: string
  }
  export interface UpdatePhoneNumberForm extends AddPhoneNumberForm {
    phoneId: number
  }
  export interface AddEmailAddressForm {
    emailAddress: string
  }
  export interface UpdateEmailAddressForm {
    emailAddress: string
    emailId: number
  }
}
