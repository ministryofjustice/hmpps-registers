import type { Court } from '../../@types/courtRegister'

export default {
  court: ({
    courtId = 'SHFCC',
    courtName = 'Sheffield Crown Court',
    courtDescription = 'Sheffield Crown Court - Yorkshire',
    courtType = 'CROWN',
    type = { courtType: 'CROWN', courtName: 'Crown' },
    active = true,
  }: Partial<Court>): Court =>
    ({
      courtId,
      courtName,
      courtDescription,
      courtType,
      type,
      active,
    } as Court),
}
