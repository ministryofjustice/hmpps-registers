declare module 'prisonForms' {
  export interface AddNewPrisonForm {
    id?: string
    name: string
    prisonNameInWelsh?: string
    gender: string[]
    contracted: string
    // the id of the operator chosen for a contracted prison
    operator?: string
    // the operator that will be saved: the one chosen, or PSP when the prison is not contracted
    prisonOperator?: { id: number; name: string }
    lthse: string
    prisonTypes?: string[]
    addressline1?: string
    addressline2?: string
    addresstown: string
    addresscounty?: string
    addresspostcode: string
    addresscountry: string
    completed?: boolean
  }

  export interface UpdatePrisonDetailForm {
    name?: string
    description?: string
    prisonNameInWelsh?: string
    gender?: string | string[]
    prisonTypes?: string | string[]
    contracted?: string
    operator?: string
    lthse?: string
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
  export interface WelshPrisonAddressForm {
    addressId?: string
    prisonId: string
    addressline1inwelsh?: string
    addressline2inwelsh?: string
    addresstowninwelsh: string
    addresscountyinwelsh?: string
    addresscountryinwelsh?: string
  }
}
