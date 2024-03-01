import { Prison, PrisonAddress } from '../../@types/prisonRegister'

export default {
  prisonAddress: ({
    id = 21,
    addressLine1 = 'Bawtry Road',
    addressLine2 = 'Hatfield Woodhouse',
    town = 'Doncaster',
    postcode = 'DN7 6BW',
    county = 'South Yorkshire',
    country = 'England',
  }: Partial<PrisonAddress>): PrisonAddress =>
    ({
      id,
      addressLine1,
      addressLine2,
      town,
      postcode,
      county,
      country,
    }) as PrisonAddress,

  prison: ({
    prisonId = 'ALI',
    prisonName = 'Albany (HMP)',
    active = true,
    male = true,
    female = true,
    contracted = false,
    addresses = [],
    types = [{ code: 'HMP', description: 'His Majesty’s Prison' }],
    operators = [{ name: 'PSP' }],
  }: Partial<Prison>): Prison =>
    ({
      prisonId,
      prisonName,
      active,
      male,
      female,
      contracted,
      addresses,
      types,
      operators,
    }) as Prison,
}
