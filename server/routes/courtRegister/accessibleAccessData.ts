import type { UpdateCourt } from '../../@types/prisonRegister'

export const accessibleAccessOptions = [
  { value: 'NONE', text: 'No accessible access' },
  { value: 'ACCESSIBLE', text: 'Yes, access is accessible' },
  { value: 'BY_ARRANGEMENT_ONLY', text: 'Yes, but by arrangement only' },
  { value: 'WHEELCHAIR_ACCESS', text: 'Has wheelchair access' },
  { value: 'UNKNOWN', text: "Don't know" },
] as const satisfies ReadonlyArray<{ value: NonNullable<UpdateCourt['accessibleAccess']> | 'UNKNOWN'; text: string }>

export type AccessibleAccessOption = (typeof accessibleAccessOptions)[number]['value']

export function isAccessibleAccessOption(value: string): value is AccessibleAccessOption {
  return accessibleAccessOptions.some(option => option.value === value)
}
