import Validator, { ErrorMessages, Rules } from 'validatorjs'
import { Court, CourtBuilding } from '../@types/courtRegister'

export default function validateAsync<T>(
  form: T,
  rules: Rules,
  customMessages: ErrorMessages,
  lookups: {
    courtLookup: (subCode: string) => Promise<Court | null>
    courtBuildingLookup: (subCode: string) => Promise<CourtBuilding | null>
  } = {
    courtLookup: () => null,
    courtBuildingLookup: () => null,
  }
): Promise<Array<{ text: string; href: string }>> {
  Validator.register(
    'postcode',
    value => {
      if (typeof value === 'string') {
        return Boolean(
          value.replace(/[\s.,/=\-_`()]/g, '').match(/^[A-Z]{1,2}[0-9R][0-9A-Z]?[0-9][ABD-HJLNP-UW-Z]{2}$/)
        ).valueOf()
      }
      return false
    },
    'Enter a real postcode, like AA11AA'
  )

  Validator.registerAsync(
    'unique-subcode',
    async (value, requirement, request, passes) => {
      if (typeof value === 'string') {
        if (!isBlank(value)) {
          const existingCourt = await lookups.courtLookup(value)
          if (existingCourt) {
            passes(false, `${existingCourt.courtName} already has that code. Choose another code`)
            return
          }
          const existingCourtBuilding = await lookups.courtBuildingLookup(value)
          if (existingCourtBuilding) {
            passes(
              false,
              `The court building ${existingCourtBuilding.buildingName} already has that code. Choose another code`
            )
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
const checkErrorsAsync = <T>(validation: Validator.Validator<T>): Promise<Array<{ text: string; href: string }>> => {
  const asErrors = (errors: Validator.Errors) =>
    Object.keys(errors.all()).map(key => {
      const message = errors.first(key) as string
      return { text: message, href: `#${key}` }
    })

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

const isBlank = (text: string) => {
  return !text || text.trim().length === 0
}
