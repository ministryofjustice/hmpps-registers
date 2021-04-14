/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/court-maintenance/id/{courtId}': {
    /** Updates court information, role required is MAINTAIN_REF_DATA */
    put: operations['updateCourt']
  }
  '/court-maintenance/id/{courtId}/buildings/{buildingId}': {
    /** Updates building information, role required is MAINTAIN_REF_DATA */
    put: operations['updateBuilding']
    /** Deletes building information, role required is MAINTAIN_REF_DATA */
    delete: operations['deleteBuilding']
  }
  '/court-maintenance/id/{courtId}/buildings/{buildingId}/contacts/{contactId}': {
    /** Updates contact information, role required is MAINTAIN_REF_DATA */
    put: operations['updateContact']
    /** Deletes contact information, role required is MAINTAIN_REF_DATA */
    delete: operations['deleteContact']
  }
  '/court-maintenance': {
    /** Adds a new court information, role required is MAINTAIN_REF_DATA */
    post: operations['insertCourt']
  }
  '/court-maintenance/id/{courtId}/buildings': {
    /** Adds a new building to court, role required is MAINTAIN_REF_DATA */
    post: operations['insertBuilding']
  }
  '/court-maintenance/id/{courtId}/buildings/{buildingId}/contacts': {
    /** Adds a new contact to building, role required is MAINTAIN_REF_DATA */
    post: operations['insertContact']
  }
  '/courts': {
    /** All courts (active only) */
    get: operations['getActiveCourts']
  }
  '/courts/types': {
    /** All court types */
    get: operations['getCourtTypes']
  }
  '/courts/paged': {
    /** Page of courts */
    get: operations['getPageOfCourts']
  }
  '/courts/id/{courtId}': {
    /** Information on a specific court */
    get: operations['getCourtFromId']
  }
  '/courts/id/{courtId}/buildings/id/{buildingId}': {
    /** Information on a specific building */
    get: operations['getBuildingFromId']
  }
  '/courts/id/{courtId}/buildings/id/{buildingId}/contacts/id/{contactId}': {
    /** Information on a specific contact */
    get: operations['getContactFromId']
  }
  '/courts/buildings/sub-code/{subCode}': {
    /** Information on a specific building by sub-code */
    get: operations['getBuildingFromSubCode']
  }
  '/courts/all': {
    /** All active/inactive courts */
    get: operations['getAllCourts']
  }
}

export interface components {
  schemas: {
    /** Court Update Record */
    UpdateCourtDto: {
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      /** Type of court */
      courtType: string
      /** Whether the court is still active */
      active: boolean
    }
    /** Building */
    BuildingDto: {
      /** Unique ID of the building */
      id: number
      /** Court Id for this building */
      courtId: string
      /** Sub location code for referencing building */
      subCode?: string
      /** Building Name */
      buildingName?: string
      /** Street Number and Name */
      street?: string
      /** Locality */
      locality?: string
      /** Town/City */
      town?: string
      /** County */
      county?: string
      /** Postcode */
      postcode?: string
      /** Country */
      country?: string
      /** List of contacts for this building by type */
      contacts?: components['schemas']['ContactDto'][]
    }
    /** Contact */
    ContactDto: {
      /** Unique ID of the contact */
      id: number
      /** Court Id for this contact */
      courtId: string
      /** Building Id for this contact */
      buildingId: number
      /** Type of contact */
      type: 'TEL' | 'FAX'
      /** Details of the contact */
      detail?: string
    }
    /** Court Information */
    CourtDto: {
      /** Court ID */
      courtId: string
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      type: components['schemas']['CourtTypeDto']
      /** Whether the court is still active */
      active: boolean
      /** List of buildings for this court entity */
      buildings?: components['schemas']['BuildingDto'][]
    }
    /** Court Type */
    CourtTypeDto: {
      /** Type of court */
      courtType: string
      /** Description of the type of court */
      courtName: string
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** Building Update Record */
    UpdateBuildingDto: {
      /** Building Name */
      buildingName?: string
      /** Street Number and Name */
      street?: string
      /** Locality */
      locality?: string
      /** Town/City */
      town?: string
      /** County */
      county?: string
      /** Postcode */
      postcode?: string
      /** Country */
      country?: string
      /** Sub location code for referencing building */
      subCode?: string
    }
    /** Contact */
    UpdateContactDto: {
      /** Type of contact */
      type: 'TEL' | 'FAX'
      /** Details of the contact */
      detail: string
    }
    /** Court Insert Record */
    InsertCourtDto: {
      /** Court ID */
      courtId: string
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      /** Type of court */
      courtType: string
      /** Whether the court is still active */
      active: boolean
    }
    CourtDtoPage: {
      content?: components['schemas']['CourtDto'][]
      pageable?: components['schemas']['Pageable']
      last?: boolean
      totalPages?: number
      totalElements?: number
      size?: number
      number?: number
      sort?: components['schemas']['Sort']
      first?: boolean
      numberOfElements?: number
      empty?: boolean
    }
    Pageable: {
      page?: number
      size?: number
      sort?: string[]
    }
    Sort: {
      sorted?: boolean
      unsorted?: boolean
      empty?: boolean
    }
  }
}

export interface operations {
  /** Updates court information, role required is MAINTAIN_REF_DATA */
  updateCourt: {
    parameters: {
      path: {
        courtId: string
      }
    }
    responses: {
      /** Court Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['CourtDto']
        }
      }
      /** Information request to update court */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make court update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Court ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateCourtDto']
      }
    }
  }
  /** Updates building information, role required is MAINTAIN_REF_DATA */
  updateBuilding: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
      }
    }
    responses: {
      /** Building Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['BuildingDto']
        }
      }
      /** Information request to update building */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make building update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Building ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateBuildingDto']
      }
    }
  }
  /** Deletes building information, role required is MAINTAIN_REF_DATA */
  deleteBuilding: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
      }
    }
    responses: {
      /** Building Information Deleted */
      200: {
        content: {
          'application/json': components['schemas']['BuildingDto']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to delete building */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Building ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Updates contact information, role required is MAINTAIN_REF_DATA */
  updateContact: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
        contactId: number
      }
    }
    responses: {
      /** Building Contact Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['ContactDto']
        }
      }
      /** Information request to update contact */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make contact update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateContactDto']
      }
    }
  }
  /** Deletes contact information, role required is MAINTAIN_REF_DATA */
  deleteContact: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
        contactId: number
      }
    }
    responses: {
      /** Building Contact Information Deleted */
      200: {
        content: {
          'application/json': components['schemas']['ContactDto']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to delete contact */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Adds a new court information, role required is MAINTAIN_REF_DATA */
  insertCourt: {
    responses: {
      /** Court Information Inserted */
      201: {
        content: {
          'application/json': components['schemas']['CourtDto']
        }
      }
      /** Information request to add a court */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make court insert */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['InsertCourtDto']
      }
    }
  }
  /** Adds a new building to court, role required is MAINTAIN_REF_DATA */
  insertBuilding: {
    parameters: {
      path: {
        courtId: string
      }
    }
    responses: {
      /** Building Information Inserted */
      201: {
        content: {
          'application/json': components['schemas']['BuildingDto']
        }
      }
      /** Invalid request to add a building */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make building insert */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateBuildingDto']
      }
    }
  }
  /** Adds a new contact to building, role required is MAINTAIN_REF_DATA */
  insertContact: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
      }
    }
    responses: {
      /** Contact Information Inserted */
      201: {
        content: {
          'application/json': components['schemas']['ContactDto']
        }
      }
      /** Invalid request to add a contact */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to add contact insert */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateContactDto']
      }
    }
  }
  /** All courts (active only) */
  getActiveCourts: {
    responses: {
      /** All Active Court Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['CourtDto'][]
        }
      }
    }
  }
  /** All court types */
  getCourtTypes: {
    responses: {
      /** All Types of courts returned */
      200: {
        content: {
          'application/json': components['schemas']['CourtTypeDto'][]
        }
      }
    }
  }
  /** Page of courts */
  getPageOfCourts: {
    parameters: {
      query: {
        /** Active? */
        active?: boolean
        /** Court Type */
        courtTypeIds?: string[]
        pageable?: components['schemas']['Pageable']
      }
    }
    responses: {
      /** All Court Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['CourtDtoPage'][]
        }
      }
    }
  }
  /** Information on a specific court */
  getCourtFromId: {
    parameters: {
      path: {
        courtId: string
      }
    }
    responses: {
      /** Court Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['CourtDto']
        }
      }
      /** Incorrect request to get court information */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Court ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Information on a specific building */
  getBuildingFromId: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
      }
    }
    responses: {
      /** Building Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['BuildingDto']
        }
      }
      /** Incorrect request to get building information */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Building ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Information on a specific contact */
  getContactFromId: {
    parameters: {
      path: {
        courtId: string
        buildingId: number
        contactId: number
      }
    }
    responses: {
      /** Contact Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['ContactDto']
        }
      }
      /** Incorrect request to get contact information */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Contact ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Information on a specific building by sub-code */
  getBuildingFromSubCode: {
    parameters: {
      path: {
        subCode: string
      }
    }
    responses: {
      /** Building Information Returned */
      200: {
        content: {
          'application/json': components['schemas']['BuildingDto']
        }
      }
      /** Incorrect request to get building information */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Building SubCode not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** All active/inactive courts */
  getAllCourts: {
    responses: {
      /** All Court Information Returned (Active only) */
      200: {
        content: {
          'application/json': components['schemas']['CourtDto'][]
        }
      }
    }
  }
}
