declare module 'forms' {
  export interface AddNewCourtForm {
    type?: string
    id?: string
    name?: string
    description?: string
    buildingname?: string
    addressline1?: string
    addressline2?: string
    addresstown?: string
    addresscounty?: string
    addresspostcode?: string
    addresscountry?: string
    telephonenumber?: string
    faxnumber?: string
    completed?: boolean
  }
}
