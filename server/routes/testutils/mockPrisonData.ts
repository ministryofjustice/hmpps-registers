import { Prison, PrisonAddress } from '../../@types/prisonRegister'

export default {
  prisonAddress: ({
    addressLine1 = 'Bawtry Road',
    addressLine2 = 'Hatfield Woodhouse',
    town = 'Doncaster',
    postcode = 'DN7 6BW',
    county = 'South Yorkshire',
    country = 'England',
  }: Partial<PrisonAddress>): PrisonAddress =>
    ({
      addressLine1,
      addressLine2,
      town,
      postcode,
      county,
      country,
    } as PrisonAddress),

  prison: ({
    prisonId = 'ALI',
    prisonName = 'Albany (HMP)',
    active = true,
    male = true,
    female = true,
    addresses = [],
  }: Partial<Prison>): Prison =>
    ({
      prisonId,
      prisonName,
      active,
      male,
      female,
      addresses,
    } as Prison),
}
