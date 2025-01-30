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
    prisonNameInWelsh = '',
    active = true,
    male = true,
    female = true,
    contracted = false,
    lthse = false,
    addresses = [],
    types = [{ code: 'HMP', description: 'His Majesty’s Prison' }],
    operators = [{ name: 'PSP' }],
  }: Partial<Prison>): Prison =>
    ({
      prisonId,
      prisonName,
      prisonNameInWelsh,
      active,
      male,
      female,
      contracted,
      lthse,
      addresses,
      types,
      operators,
    }) as Prison,
}
