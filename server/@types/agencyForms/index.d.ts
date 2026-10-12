declare module 'agencyForms' {
  export interface AddPhoneNumberForm {
    phoneNumber: string
  }
  export interface AddEmailAddressForm {
    emailAddress: string
  }
  export interface UpdateEmailAddressForm {
    emailAddress: string
    emailId: number
  }
}
