import Validator, { ErrorMessages, Rules } from 'validatorjs'
import { Court, CourtBuilding } from '../@types/courtRegister'

Validator.register(
  'postcode',
  value => {
    if (typeof value === 'string') {
      return Boolean(
        value.replace(/[\s.,/=\-_`()]/g, '').match(/^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/i)
      ).valueOf()
    }
    return false
  },
  'Enter a real postcode, like AA11AA'
)
type lookupFn<T> = (code: string) => Promise<T | undefined>

export function validateAsync<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages,
  lookups: {
    courtLookup?: lookupFn<Court | undefined>
    courtBuildingLookup?: lookupFn<CourtBuilding | undefined>
    courtMainBuildingLookup?: lookupFn<CourtBuilding | undefined>
  } = {
    courtLookup: () => Promise.resolve(undefined),
    courtBuildingLookup: () => Promise.resolve(undefined),
    courtMainBuildingLookup: () => Promise.resolve(undefined),
  }
): Promise<Array<{ text: string; href: string }>> {
  Validator.registerAsync(
    'unique-subcode',
    async (value, allowedBuildingId, request, passes) => {
      if (
        typeof value === 'string' &&
        typeof lookups.courtLookup === 'function' &&
        typeof lookups.courtBuildingLookup === 'function'
      ) {
        if (isCourtOrBuildingCode(value)) {
          const existingCourt = await lookups.courtLookup(value)
          if (existingCourt) {
            passes(false, `${existingCourt.courtName} already has that code. Choose another code`)
            return
          }
          const existingCourtBuilding = await lookups.courtBuildingLookup(value)
          if (existingCourtBuilding) {
            if (existingCourtBuilding.id !== Number.parseInt(allowedBuildingId, 10)) {
              passes(
                false,
                `The court building ${existingCourtBuilding.buildingName} already has that code. Choose another code`
              )
              return
            }
          }
        }
      }
      passes()
    },
    `The code is already used. Choose another code`
  )
  Validator.registerAsyncImplicit(
    'single-main-building',
    async (subCode, requirement, request, passes) => {
      const [courtId, allowedBuildingId]: [string, string] = requirement.split(',') as [string, string]
      if (subCode === '' && typeof lookups.courtMainBuildingLookup === 'function') {
        const existingBuildingWithNullSubCode = await lookups.courtMainBuildingLookup(courtId)
        if (existingBuildingWithNullSubCode) {
          if (!allowedBuildingId || existingBuildingWithNullSubCode.id !== Number.parseInt(allowedBuildingId, 10)) {
            passes(
              false,
              `The building ${existingBuildingWithNullSubCode.buildingName} is already saved as the main building (with blank code). Please enter a code.`
            )
            return
          }
        }
      }
      passes()
    },
    'A main building already exists for this court'
  )
  Validator.registerAsync(
    'unique-court-code',
    async (value, requirment, request, passes) => {
      if (typeof value === 'string' && typeof lookups.courtLookup === 'function') {
        if (isCourtOrBuildingCode(value)) {
          const existingCourt = await lookups.courtLookup(value)
          if (existingCourt) {
            passes(false, `${existingCourt.courtName} already has that code. Choose another code`)
            return
          }
        }
      }
      passes()
    },
    `The code is already used. Choose another code`
  )

  const validation = new Validator(form, rules, customMessages)

  return checkErrorsAsync(validation)
}
export function validate<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages
): Array<{ text: string; href: string }> {
  const validation = new Validator(form, rules, customMessages)

  return checkErrors(validation)
}
const checkErrorsAsync = <T>(validation: Validator.Validator<T>): Promise<Array<{ text: string; href: string }>> => {
  return new Promise(resolve => {
    validation.checkAsync(
      () => {
        resolve([])
      },
      () => {
        resolve(asErrors(validation.errors))
      }
    )
  })
}
const checkErrors = <T>(validation: Validator.Validator<T>): Array<{ text: string; href: string }> => {
  validation.check()
  return asErrors(validation.errors)
}

const isCourtOrBuildingCode = (code: string) => {
  return new Validator({ code }, { code: 'between:2,12' }).passes()
}

const asErrors = (errors: Validator.Errors) =>
  Object.keys(errors.all()).map(key => {
    const message = errors.first(key) as string
    return { text: message, href: `#${key}` }
  })
