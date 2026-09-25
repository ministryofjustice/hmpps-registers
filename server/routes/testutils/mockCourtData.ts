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
    }) as Court,
}
