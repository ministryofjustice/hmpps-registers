import type { DepartmentType } from '../../@types/prisonRegister'

export const departmentNames: Record<DepartmentType, string> = {
  PRISON: 'Prison',
  SOCIAL_VISIT: 'Social visits',
  VIDEOLINK_CONFERENCING_CENTRE: 'Video link conferencing centre',
  OFFENDER_MANAGEMENT_UNIT: 'Offender management unit',
  OFFICIAL_VISIT: 'Official visits',
}

export const departmentTypes = Object.keys(departmentNames) as DepartmentType[]

export const isDepartmentType = (value: unknown): value is DepartmentType =>
  typeof value === 'string' && departmentTypes.includes(value as DepartmentType)

export const departmentName = (type: string): string => departmentNames[type as DepartmentType] ?? type
