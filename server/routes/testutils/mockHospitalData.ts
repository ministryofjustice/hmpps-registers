import { Hospital } from '../../@types/prisonRegister'

export default {
  hospital: ({
    hospitalId = 'SHEFH',
    hospitalName = 'Sheffield Hospital',
    description = 'Sheffield City Centre Hospital',
    active = true,
    inactiveDate = undefined,
    highSecurity = false,
    cjitCode = 'C00SH00',
    area = { code: 'YH', description: 'Yorkshire and the Humber' },
    region = { code: 'YH', description: 'Yorkshire and the Humber' },
    geographicalArea = { code: 'YH', description: 'Yorkshire and the Humber' },
    localAuthority = { code: 'YH', description: 'Yorkshire and the Humber' },
    payrollRegion = { code: 'YH', description: 'Yorkshire and the Humber' },
    addresses = [],
    phoneNumbers = [],
  }: Partial<Hospital>): Hospital =>
    ({
      hospitalId,
      hospitalName,
      description,
      active,
      inactiveDate,
      highSecurity,
      cjitCode,
      area,
      region,
      geographicalArea,
      localAuthority,
      payrollRegion,
      addresses,
      phoneNumbers,
    }) as Hospital,
}
