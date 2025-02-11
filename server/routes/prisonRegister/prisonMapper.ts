import { OperatorType, Prison, PrisonAddress, PrisonType } from '../../@types/prisonRegister'

export type PrisonDetail = {
  id: string
  name: string
  prisonNameInWelsh: string
  active: boolean
  male?: boolean
  female?: boolean
  contracted?: boolean
  lthse?: boolean
  addresses: AddressDetail[]
  types: TypeDetail[]
  operators: OperatorDetail[]
}

export function pageLinkMapper(): string {
  return `/prison-register`
}

export type AddressDetail = {
  id: number
  line1?: string
  line2?: string
  town: string
  county?: string
  postcode: string
  country: string
  line1inwelsh?: string
  line2inwelsh?: string
  addresstowninwelsh?: string
  addresscountyinwelsh?: string
  addresscountryinwelsh?: string
}

export type WelshAddressDetail = {
  line1inwelsh?: string
  line2inwelsh?: string
  addresstowninwelsh?: string
  addresscountryinwelsh?: string
}

export type TypeDetail = {
  code: string
  description: string
}

export type OperatorDetail = {
  name: string
}

export type PrisonPageView = {
  prisons: PrisonDetail[]
  allPrisonsFilter: AllPrisonsFilter
}

export default function prisonMapper(prison: Prison): PrisonDetail {
  return {
    id: prison.prisonId,
    name: prison.prisonName,
    prisonNameInWelsh: prison.prisonNameInWelsh,
    active: prison.active,
    male: prison.male,
    female: prison.female,
    contracted: prison.contracted,
    lthse: prison.lthse,
    addresses: prison.addresses?.map(addressMapper) || [],
    types: prison.types?.map(typeMapper) || [],
    operators: prison.operators?.map(operatorMapper) || [],
  }
}

export function addressMapper(address: PrisonAddress): AddressDetail {
  return {
    id: address.id,
    line1: address.addressLine1,
    line2: address.addressLine2,
    town: address.town,
    county: address.county,
    postcode: address.postcode,
    country: address.country,
    line1inwelsh: address.addressLine1InWelsh,
    line2inwelsh: address.addressLine2InWelsh,
    addresstowninwelsh: address.townInWelsh,
    addresscountyinwelsh: address.countyInWelsh,
    addresscountryinwelsh: address.countryInWelsh,
  }
}

export function addWelshAddressMarker(prisonDetails) {
  const addresses = prisonDetails.addresses.map(address =>
    address.addresstowninwelsh ? { ...address, hasWelshAddress: true } : { ...address, hasWelshAddress: false },
  )
  return { ...prisonDetails, addresses }
}

export function typeMapper(type: PrisonType): TypeDetail {
  return {
    code: type.code,
    description: type.description,
  }
}

export function operatorMapper(operator: OperatorType): OperatorDetail {
  return {
    name: operator.name,
  }
}

export function prisonsPageMapper(prisonResults: Prison[], allPrisonsFilter: AllPrisonsFilter): PrisonPageView {
  const prisons = prisonResults.map((prison: Prison) => prisonMapper(prison))
  return { prisons, allPrisonsFilter }
}

export type AllPrisonsFilter = {
  active?: boolean
  textSearch?: string
  genders?: string[]
  prisonTypeCodes?: string[]
  lthse?: boolean
}
