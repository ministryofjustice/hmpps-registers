declare module 'courtRegister' {
  import { components } from '../courtRegisterImport'

  export type Court = components.schemas['CourtDto']
  export type UpdateCourt = components.schemas['UpdateCourtDto']
}
