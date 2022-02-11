/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/secure/prisons/id/{prisonId}/videolink-conferencing-centre/email-address': {
    get: operations['getEmailForVideoConferencingCentre']
    put: operations['putEmailAddressForVideolinkConferencingCentre']
    delete: operations['deleteEmailAddressForVideolinkConferencingCentre']
  }
  '/secure/prisons/id/{prisonId}/offender-management-unit/email-address': {
    get: operations['getEmailForOffenderManagementUnit']
    put: operations['putEmailAddressForOffenderManagementUnit']
    delete: operations['deleteEmailAddressForOffenderManagementUnit']
  }
  '/prison-maintenance/id/{prisonId}': {
    /** Updates prison information, role required is MAINTAIN_REF_DATA */
    put: operations['updatePrison']
  }
  '/prisons': {
    /** All prisons */
    get: operations['getPrisons']
  }
  '/prisons/id/{prisonId}': {
    /** Information on a specific prison */
    get: operations['getPrisonFromId']
  }
  '/gp/prison/{prisonId}': {
    get: operations['getPrisonFromId_1']
  }
  '/gp/practice/{gpPracticeCode}': {
    get: operations['getPrisonFromGpPrescriber']
  }
}

export interface components {
  schemas: {
    /** @description Prison Update Record */
    UpdatePrisonDto: {
      /**
       * @description Name of the prison
       * @example HMPPS Moorland
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
    }
    /**
     * @description Prison Information
     * @example Details about a prison
     */
    PrisonDto: {
      /**
       * @description Prison ID
       * @example MDI
       */
      prisonId: string
      /**
       * @description Name of the prison
       * @example Moorland HMP
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
    }
    ErrorResponse: {
      /** Format: int32 */
      status: number
      /** Format: int32 */
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
  }
}

export interface operations {
  getEmailForVideoConferencingCentre: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** Returns the email address */
      200: {
        content: {
          'text/plain': unknown
        }
      }
      /** Client error - invalid prisonId or similar */
      400: {
        content: {
          'text/plain': string
        }
      }
      /** The prison does not have a Videolink Conferencing Centre email address */
      404: {
        content: {
          'text/plain': string
        }
      }
    }
  }
  putEmailAddressForVideolinkConferencingCentre: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** The email address was created */
      201: unknown
      /** The email address was updated */
      204: never
      /** Client error - invalid prisonId, email address or similar */
      400: unknown
      /** No prison found for the supplied prison id */
      404: unknown
    }
    requestBody: {
      content: {
        'text/plain': string
      }
    }
  }
  deleteEmailAddressForVideolinkConferencingCentre: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** The email address was removed */
      204: never
      /** Client error - invalid prisonId or similar */
      400: unknown
    }
  }
  getEmailForOffenderManagementUnit: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** Returns the email address */
      200: {
        content: {
          'text/plain': unknown
        }
      }
      /** Client error - invalid prisonId or similar */
      400: {
        content: {
          'text/plain': string
        }
      }
      /** The prison does not have a Offender Management Unit email address */
      404: {
        content: {
          'text/plain': string
        }
      }
    }
  }
  putEmailAddressForOffenderManagementUnit: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** The email address was created */
      201: unknown
      /** The email address was updated */
      204: never
      /** Client error - invalid prisonId, email address, media type or similar */
      400: unknown
      /** No prison found for the supplied prison id */
      404: unknown
    }
    requestBody: {
      content: {
        'text/plain': string
      }
    }
  }
  deleteEmailAddressForOffenderManagementUnit: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** The email address was removed */
      204: never
      /** Client error - invalid prisonId or similar */
      400: unknown
    }
  }
  /** Updates prison information, role required is MAINTAIN_REF_DATA */
  updatePrison: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** Prison Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
      /** Information request to update prison */
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
      /** Incorrect permissions to make prison update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Prison ID not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdatePrisonDto']
      }
    }
  }
  /** All prisons */
  getPrisons: {
    responses: {
      /** Successful Operation */
      200: {
        content: {
          'application/json': unknown
        }
      }
    }
  }
  /** Information on a specific prison */
  getPrisonFromId: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
    }
  }
  getPrisonFromId_1: {
    parameters: {
      path: {
        /** Prison ID */
        prisonId: string
      }
    }
    responses: {
      /** Bad request.  Wrong format for prison_id. */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Prison not found. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  getPrisonFromGpPrescriber: {
    parameters: {
      path: {
        /** GP Practice Code */
        gpPracticeCode: string
      }
    }
    responses: {
      /** Bad request.  Wrong format for GP practice code. */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** No prison linked to the GP practice code. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
}
