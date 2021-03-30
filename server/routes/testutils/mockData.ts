import type { Court } from '../../@types/courtRegister'

export default {
  court: ({
    courtId = 'SHFCC',
    courtName = 'Sheffield Crown Court',
    courtDescription = 'Sheffield Crown Court - Yorkshire',
    courtType = 'CROWN',
    active = true,
  }: Partial<Court>): Court =>
    ({
      courtId,
      courtName,
      courtDescription,
      courtType,
      active,
    } as Court),
}
