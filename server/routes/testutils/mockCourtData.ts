import { Court, AgencyAddress } from '../../@types/prisonRegister'

export default {
  address: ({
    id = 1,
    addressLine1 = '1 Test Street',
    addressLine2 = 'Testington',
    town = 'Testville',
    county = 'Testshire',
    postcode = 'TE1 1ST',
    country = 'Testland',
  }: Partial<AgencyAddress>): AgencyAddress =>
    ({
      id,
      addressLine1,
      addressLine2,
      town,
      county,
      postcode,
      country,
    }) as AgencyAddress,
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
    addresses = [],
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
      addresses,
    }) as Court,
}
