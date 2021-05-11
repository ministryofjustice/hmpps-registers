import { RegisterAsyncCallback } from 'validatorjs'

export declare global {
  namespace Validator {
    export interface ValidatorStatic {
      registerAsyncImplicit(name: string, fn: RegisterAsyncCallback, message: string): void
    }
  }
}
