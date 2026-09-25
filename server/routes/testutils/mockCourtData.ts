import { Court } from '../../@types/prisonRegister'

export default {
  court: ({
    courtId = 'SHFCC',
    courtName = 'Sheffield Crown Court',
    description = 'Sheffield Main Crown Court',
    active = true,
    inactiveDate = undefined,
    courtType = { code: 'CC', description: 'Crown Court' },
    accessibleAccess = 'NONE',
    cjitCode = 'C00SH00',
    area = { code: 'YH', description: 'Yorkshire and the Humber' },
    region = { code: 'YH', description: 'Yorkshire and the Humber' },
    geographicalArea = { code: 'YH', description: 'Yorkshire and the Humber' },
    localAuthority = { code: 'YH', description: 'Yorkshire and the Humber' },
    payrollRegion = { code: 'YH', description: 'Yorkshire and the Humber' },
  }: Partial<Court>): Court =>
    ({
      courtId,
      courtName,
      description,
      active,
      inactiveDate,
      courtType,
      accessibleAccess,
      cjitCode,
      area,
      region,
      geographicalArea,
      localAuthority,
      payrollRegion,
    }) as Court,
}
