declare module 'agencyForms' {
  export interface AddAddressForm {
    addressline1?: string
    addressline2?: string
    addresstown: string
    addresscounty?: string
    addresspostcode: string
    addresscountry: string
  }
  export interface UpdateAddressForm extends AddAddressForm {
    addressId: number
  }
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
  export interface UpdateNameDescriptionForm {
    name: string
    description: string
  }
  export interface UpdateCourtTypeForm {
    courtType: string
  }
  export interface UpdateAccessibleAccessForm {
    accessibleAccess: string
  }
  export interface UpdateCjitCodeForm {
    cjitCode?: string
  }
}
