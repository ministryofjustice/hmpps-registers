declare module 'prisonForms' {
  export interface AddNewPrisonForm {
    id?: string
    name: string
    gender: string[]
    contracted: string
    prisonTypes?: string[]
    addressline1?: string
    addressline2?: string
    addresstown: string
    addresscounty?: string
    addresspostcode: string
    addresscountry: string
    completed?: boolean
  }

  export interface AmendPrisonDetailsForm {
    id: string
    name: string
    gender: string[]
    prisonTypes: string[]
    contracted: string
  }
  export interface PrisonAddressForm {
    id?: string
    prisonId: string
    addressline1?: string
    addressline2?: string
    addresstown: string
    addresscounty?: string
    addresspostcode: string
    addresscountry: string
  }
}
