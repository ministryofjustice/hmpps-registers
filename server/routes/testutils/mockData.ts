import type { Court, CourtBuilding, CourtBuildingContact } from '../../@types/courtRegister'

export default {
  court: ({
    courtId = 'SHFCC',
    courtName = 'Sheffield Crown Court',
    courtDescription = 'Sheffield Crown Court - Yorkshire',
    type = { courtType: 'CROWN', courtName: 'Crown' },
    active = true,
    buildings = [],
  }: Partial<Court>): Court =>
    ({
      courtId,
      courtName,
      courtDescription,
      type,
      active,
      buildings,
    } as Court),
  courtBuilding: ({
    id = 99,
    buildingName = 'Crown Square',
    contacts = [],
    street = '1 High Street',
    locality = 'Castle Market',
    town = 'Sheffield',
    postcode = 'S1 2BJ',
    county = 'South Yorkshire',
    country = 'England',
    courtId = 'SHFCC',
    subCode = undefined,
  }: Partial<CourtBuilding>): CourtBuilding =>
    ({
      id,
      buildingName,
      contacts,
      street,
      locality,
      town,
      postcode,
      county,
      country,
      courtId,
      subCode,
    } as CourtBuilding),

  courtBuildingContact: ({
    id = 99,
    courtId = 'SHFCC',
    buildingId = 99,
    type = 'TEL',
    detail = '0114 555 1234',
  }: Partial<CourtBuildingContact>): CourtBuildingContact =>
    ({
      id,
      courtId,
      buildingId,
      type,
      detail,
    } as CourtBuildingContact),
}
