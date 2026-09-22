import { Court } from '../../@types/prisonRegister'

export default {
  court: ({
    courtId = 'SHFCC',
    courtName = 'Albany (HMP)',
    active = true,
    courtType = { code: 'CC', description: 'Crown Court' },
  }: Partial<Court>): Court =>
    ({
      courtId,
      courtName,
      active,
      courtType,
    }) as Court,
}
