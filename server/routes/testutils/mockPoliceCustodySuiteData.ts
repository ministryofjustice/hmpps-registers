import { PoliceCustodySuite } from '../../@types/prisonRegister'

export default {
  policeCustodySuite: ({
    policeCustodySuiteId = 'SHFPCS',
    policeCustodySuiteName = 'Sheffield Police Custody Suite',
    description = 'Sheffield City Centre Police Custody Suite',
    active = true,
    inactiveDate = undefined,
    cjitCode = 'C00SH00',
    area = { code: 'YH', description: 'Yorkshire and the Humber' },
    region = { code: 'YH', description: 'Yorkshire and the Humber' },
    geographicalArea = { code: 'YH', description: 'Yorkshire and the Humber' },
    localAuthority = { code: 'YH', description: 'Yorkshire and the Humber' },
    payrollRegion = { code: 'YH', description: 'Yorkshire and the Humber' },
    addresses = [],
    emailAddresses = [],
    phoneNumbers = [],
  }: Partial<PoliceCustodySuite>): PoliceCustodySuite =>
    ({
      policeCustodySuiteId,
      policeCustodySuiteName,
      description,
      active,
      inactiveDate,
      cjitCode,
      area,
      region,
      geographicalArea,
      localAuthority,
      payrollRegion,
      addresses,
      emailAddresses,
      phoneNumbers,
    }) as PoliceCustodySuite,
}
