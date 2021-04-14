import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

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
}
