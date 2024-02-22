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
  '/queue-admin/retry-dlq/{dlqName}': {
    put: operations['retryDlq']
  }
  '/queue-admin/retry-all-dlqs': {
    put: operations['retryAllDlqs']
  }
  '/queue-admin/purge-queue/{queueName}': {
    put: operations['purgeQueue']
  }
  '/prison-maintenance/id/{prisonId}': {
    /** Updates prison information, role required is MAINTAIN_REF_DATA */
    put: operations['updatePrison']
  }
  '/prison-maintenance/id/{prisonId}/address/{addressId}': {
    /** Updates address information, role required is MAINTAIN_REF_DATA */
    put: operations['updateAddress']
    /** Deletes address information for a Prison, role required is MAINTAIN_REF_DATA */
    delete: operations['deleteAddress']
  }
  '/prison-maintenance': {
    /** Adds new prison information, role required is MAINTAIN_REF_DATA */
    post: operations['insertPrison']
  }
  '/prison-maintenance/id/{prisonId}/address': {
    /** Adds an additional Address to an existing Prison, role required is MAINTAIN_REF_DATA */
    post: operations['addAddress']
  }
  '/queue-admin/get-dlq-messages/{dlqName}': {
    get: operations['getDlqMessages']
  }
  '/prisons': {
    /** All prisons */
    get: operations['getPrisons']
  }
  '/prisons/search': {
    /** All prisons */
    get: operations['getPrisonsBySearchFilter']
  }
  '/prisons/id/{prisonId}': {
    /** Information on a specific prison */
    get: operations['getPrisonFromId']
  }
  '/prisons/id/{prisonId}/address/{addressId}': {
    /** Information on a specific prison address */
    get: operations['getAddressFromId']
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
    Message: {
      messageId?: string
      receiptHandle?: string
      body?: string
      attributes?: { [key: string]: string }
      messageAttributes?: {
        [key: string]: components['schemas']['MessageAttributeValue']
      }
      md5OfBody?: string
      md5OfMessageAttributes?: string
    }
    MessageAttributeValue: {
      stringValue?: string
      binaryValue?: {
        /** Format: int32 */
        short?: number
        char?: string
        /** Format: int32 */
        int?: number
        /** Format: int64 */
        long?: number
        /** Format: float */
        float?: number
        /** Format: double */
        double?: number
        direct?: boolean
        readOnly?: boolean
      }
      stringListValues?: string[]
      binaryListValues?: {
        /** Format: int32 */
        short?: number
        char?: string
        /** Format: int32 */
        int?: number
        /** Format: int64 */
        long?: number
        /** Format: float */
        float?: number
        /** Format: double */
        double?: number
        direct?: boolean
        readOnly?: boolean
      }[]
      dataType?: string
    }
    RetryDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      messages: components['schemas']['Message'][]
    }
    PurgeQueueResult: {
      /** Format: int32 */
      messagesFoundCount: number
    }
    /** @description Prison Update Record */
    UpdatePrisonDto: {
      /**
       * @description Name of the prison
       * @example HMP Moorland
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
      /** @description If this is a male prison */
      male: boolean
      /** @description If this is a female prison */
      female: boolean
      /** @description If this is a contracted prison */
      contracted: boolean
      /** @description Set of types for this prison */
      prisonTypes: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
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
    /** @description List of address for this prison */
    AddressDto: {
      /**
       * Format: int64
       * @description Unique ID of the address
       * @example 10000
       */
      id: number
      /**
       * @description Address line 1
       * @example Bawtry Road
       */
      addressLine1?: string
      /**
       * @description Address line 2
       * @example Hatfield Woodhouse
       */
      addressLine2?: string
      /**
       * @description Village/Town/City
       * @example Doncaster
       */
      town: string
      /**
       * @description County
       * @example South Yorkshire
       */
      county?: string
      /**
       * @description Postcode
       * @example DN7 6BW
       */
      postcode: string
      /**
       * @description Country
       * @example England
       */
      country: string
    }
    /** @description Prison Information */
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
      /** @description Whether the prison has male prisoners */
      male: boolean
      /** @description Whether the prison has female prisoners */
      female: boolean
      /** @description Whether the prison is contracted */
      contracted: boolean
      /** @description List of types for this prison */
      types: components['schemas']['PrisonTypeDto'][]
      /** @description List of address for this prison */
      addresses: components['schemas']['AddressDto'][]
      /** @description List of operators for this prison */
      operators: components['schemas']['PrisonOperatorDto'][]
    }
    /** @description List of operators for this prison */
    PrisonOperatorDto: {
      /**
       * @description Prison operator name
       * @example PSP, G4S
       */
      name: string
    }
    /** @description List of types for this prison */
    PrisonTypeDto: {
      /**
       * @description Prison type code
       * @example HMP
       * @enum {string}
       */
      code: 'HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS'
      /**
       * @description Prison type description
       * @example His Majesty’s Prison
       */
      description: string
    }
    /** @description Address Update Record */
    UpdateAddressDto: {
      /**
       * @description Address line 1
       * @example Bawtry Road
       */
      addressLine1?: string
      /**
       * @description Address line 2
       * @example Hatfield Woodhouse
       */
      addressLine2?: string
      /**
       * @description Village/Town/City
       * @example Doncaster
       */
      town: string
      /**
       * @description County
       * @example South Yorkshire
       */
      county?: string
      /**
       * @description Postcode
       * @example DN7 6BW
       */
      postcode: string
      /**
       * @description Country
       * @example England
       */
      country: string
    }
    /** @description Prison Insert Record */
    InsertPrisonDto: {
      /**
       * @description Prison Id
       * @example MDI
       */
      prisonId: string
      /**
       * @description Name of the prison
       * @example HMP Moorland
       */
      prisonName: string
      /** @description Whether the prison is still active */
      active: boolean
      /** @description If this is a male prison */
      male: boolean
      /** @description If this is a female prison */
      female: boolean
      /** @description If this is a contracted prison */
      contracted: boolean
      /**
       * @description Set of types for this prison
       * @example HMP
       */
      prisonTypes: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
      /** @description List of addresses for this prison */
      addresses: components['schemas']['UpdateAddressDto'][]
    }
    DlqMessage: {
      body: { [key: string]: { [key: string]: unknown } }
      messageId: string
    }
    GetDlqResult: {
      /** Format: int32 */
      messagesFoundCount: number
      /** Format: int32 */
      messagesReturnedCount: number
      messages: components['schemas']['DlqMessage'][]
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
  retryDlq: {
    parameters: {
      path: {
        dlqName: string
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult']
        }
      }
    }
  }
  retryAllDlqs: {
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['RetryDlqResult'][]
        }
      }
    }
  }
  purgeQueue: {
    parameters: {
      path: {
        queueName: string
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['PurgeQueueResult']
        }
      }
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
  /** Updates address information, role required is MAINTAIN_REF_DATA */
  updateAddress: {
    parameters: {
      path: {
        prisonId: string
        addressId: number
      }
    }
    responses: {
      /** Address Information Updated */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
        }
      }
      /** Bad Information request to update address */
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
      /** Incorrect permissions to make address update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Address Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateAddressDto']
      }
    }
  }
  /** Deletes address information for a Prison, role required is MAINTAIN_REF_DATA */
  deleteAddress: {
    parameters: {
      path: {
        prisonId: string
        addressId: number
      }
    }
    responses: {
      /** Address Information Deleted */
      200: unknown
      /** Unauthorized to access this endpoint */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Incorrect permissions to make address update */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Address Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Adds new prison information, role required is MAINTAIN_REF_DATA */
  insertPrison: {
    responses: {
      /** Prison Information Inserted */
      201: {
        content: {
          'application/json': components['schemas']['PrisonDto']
        }
      }
      /** Information request to add prison */
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
      /** Incorrect permissions to make prison insert */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['InsertPrisonDto']
      }
    }
  }
  /** Adds an additional Address to an existing Prison, role required is MAINTAIN_REF_DATA */
  addAddress: {
    parameters: {
      path: {
        prisonId: string
      }
    }
    responses: {
      /** New Address added to Prison */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
        }
      }
      /** Bad Information request to update address */
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
      /** Incorrect permissions to add Prison address */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Prison Id not found */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateAddressDto']
      }
    }
  }
  getDlqMessages: {
    parameters: {
      path: {
        dlqName: string
      }
      query: {
        maxMessages?: number
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          '*/*': components['schemas']['GetDlqResult']
        }
      }
    }
  }
  /** All prisons */
  getPrisons: {
    responses: {
      /** Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto'][]
        }
      }
    }
  }
  /** All prisons */
  getPrisonsBySearchFilter: {
    parameters: {
      query: {
        /** Active */
        active?: boolean
        /** Text search */
        textSearch?: string
        /** Genders to filter by */
        genders?: ('MALE' | 'FEMALE')[]
        /** Prison type codes to filter by */
        prisonTypeCodes?: ('HMP' | 'YOI' | 'IRC' | 'STC' | 'YCS')[]
      }
    }
    responses: {
      /** Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['PrisonDto'][]
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
  /** Information on a specific prison address */
  getAddressFromId: {
    parameters: {
      path: {
        prisonId: string
        addressId: number
      }
    }
    responses: {
      /** Successful Operation */
      200: {
        content: {
          'application/json': components['schemas']['AddressDto']
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
