declare module 'courtRegister' {
  import { components } from '../courtRegisterImport'

  export type Court = components.schemas['CourtDto']
  export type CourtsPage = components.schemas['CourtDtoPage']
  export type UpdateCourt = components.schemas['UpdateCourtDto']
  export type CourtType = components.schemas['CourtTypeDto']
}
