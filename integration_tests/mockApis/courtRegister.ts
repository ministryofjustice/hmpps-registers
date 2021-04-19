import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { Court, CourtBuilding } from '../../server/@types/courtRegister'

export const sheffieldMagistratesMainBuilding: CourtBuilding = {
  id: 1,
  courtId: 'SHFMC',
  buildingName: 'Sheffield Courts',
  street: 'Castle Street',
  locality: 'Sheffield City Centre',
  town: 'Sheffield',
  county: 'South Yorkshire',
  postcode: ' S3 8LU',
  country: 'England',
  contacts: [],
}

export const sheffieldMagistratesAnnexeBuilding: CourtBuilding = {
  id: 2,
  courtId: 'SHFMC',
  subCode: 'SHFAN',
  buildingName: 'Sheffield Court Annexe',
  street: '25 Castle Street',
  locality: 'Sheffield City Centre',
  town: 'Sheffield',
  county: 'South Yorkshire',
  postcode: ' S3 8LU',
  country: 'England',
  contacts: [],
}

export const sheffieldCrownCourt: Court = {
  courtId: 'SHFCC',
  courtName: 'Sheffield Crown Court',
  courtDescription: 'Sheffield Main Court - Yorkshire',
  type: { courtType: 'CRN', courtName: 'Crown' },
  active: true,
  buildings: [],
}
export const sheffieldMagistratesCourt: Court = {
  courtId: 'SHFMC',
  courtName: 'Sheffield Magistrates Court',
  courtDescription: 'Sheffield Secondary Court - Yorkshire',
  type: { courtType: 'MAG', courtName: 'Magistrates' },
  active: false,
  buildings: [sheffieldMagistratesMainBuilding, sheffieldMagistratesAnnexeBuilding],
}

export const sheffieldYouthCourt: Court = {
  courtId: 'SHFYC',
  courtName: 'Sheffield Youth Court',
  courtDescription: 'Sheffield Youth Court - Yorkshire',
  type: { courtType: 'YOUTH', courtName: 'Youth' },
  active: false,
  buildings: [],
}

const stubPing = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/health/ping',
    },
    response: {
      status: 200,
    },
  })

const stubAllCourts = (courts: Array<Record<string, unknown>>): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/courts/all',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courts,
    },
  })

const stubPageOfCourts = (courtPage: Record<string, unknown>): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/court-register/courts/paged.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: courtPage,
    },
  })
const stubCourt = (court: Record<string, unknown>): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/court-register/courts/id/${court.courtId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: court,
    },
  })

const stubCourtBuilding = (building: CourtBuilding): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/court-register/courts/id/${building.courtId}/buildings/id/${building.id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: building,
    },
  })

const stubUpdateCourt = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      urlPattern: `/court-register/court-maintenance/id/.*`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        courtType: 'MAGISTRATES',
        active: false,
      },
    },
  })

const stubAddCourt = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/court-register/court-maintenance`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        courtId: 'SHFMC',
        courtName: 'Sheffield Magistrates Court',
        courtDescription: 'Sheffield Magistrates Court - Yorkshire',
        courtType: 'MAGISTRATES',
        active: false,
      },
    },
  })

const stubAddCourtBuilding = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/court-register/court-maintenance/id/.*/buildings`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        id: 99,
        courtId: 'SHFCC',
      },
    },
  })

const stubAddCourtBuildingContact = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: `/court-register/court-maintenance/id/.*/buildings/.*/contacts`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        id: 99,
        buildingId: 99,
        courtId: 'SHFCC',
      },
    },
  })

const stubCourtTypes = (): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/court-register/courts/types`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [
        {
          courtType: 'CMT',
          courtName: 'Court Martial',
        },
        {
          courtType: 'COA',
          courtName: 'Court of Appeal',
        },
        {
          courtType: 'COU',
          courtName: 'County Court/County Divorce Ct',
        },
        {
          courtType: 'CRN',
          courtName: 'Crown Court',
        },
        {
          courtType: 'DIS',
          courtName: 'District Court (Scottish)',
        },
        {
          courtType: 'HGH',
          courtName: 'High Court (Scottish)',
        },
        {
          courtType: 'MAG',
          courtName: 'Magistrates Court',
        },
        {
          courtType: 'OEW',
          courtName: 'Court Outside England/Wales',
        },
        {
          courtType: 'SHF',
          courtName: "Sherriff's Court (Scottish)",
        },
        {
          courtType: 'YTH',
          courtName: 'Youth Court',
        },
        {
          courtType: 'COM',
          courtName: 'Community',
        },
        {
          courtType: 'IMM',
          courtName: 'Immigration Court',
        },
        {
          courtType: 'OTH',
          courtName: 'Other Court',
        },
      ],
    },
  })

export default {
  stubAllCourts,
  stubPageOfCourts,
  stubPing,
  stubCourt,
  stubUpdateCourt,
  stubCourtTypes,
  stubAddCourt,
  stubAddCourtBuilding,
  stubAddCourtBuildingContact,
  stubCourtBuilding,
}
