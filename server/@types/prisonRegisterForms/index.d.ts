declare module 'prisonForms' {
  export interface AmendPrisonDetailsForm {
    id: string
    name: string
    gender: string[]
    prisonTypes: string[]
  }
  export interface AmendPrisonAddressForm {
    id: string
    prisonId: string
    addressline1?: string
    addressline2?: string
    addresstown: string
    addresscounty?: string
    addresspostcode: string
    addresscountry: string
  }
}
