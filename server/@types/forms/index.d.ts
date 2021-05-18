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

  export interface AmendCourtDetailsForm {
    type: string
    id: string
    name?: string
    description?: string
  }
  export interface AmendCourtBuildingForm {
    id: string
    courtId?: string
    buildingname?: string
    subCode?: string
    addressline1?: string
    addressline2?: string
    addresstown?: string
    addresscounty?: string
    addresspostcode?: string
    addresscountry?: string
    active: boolean
  }
  export interface AddCourtBuildingForm {
    courtId?: string
    buildingname?: string
    subCode?: string
    addressline1?: string
    addressline2?: string
    addresstown?: string
    addresscounty?: string
    addresspostcode?: string
    addresscountry?: string
  }

  export interface AmendCourtBuildingContactsForm {
    buildingname: string
    buildingId: string
    courtId: string
    contacts: {
      id?: string
      type?: 'TEL' | 'FAX'
      number?: string
    }[]
  }
}
