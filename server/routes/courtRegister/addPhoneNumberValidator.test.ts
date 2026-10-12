import type { AddPhoneNumberForm } from 'agencyForms'
import { Request } from 'express'
import validate from './addPhoneNumberValidator'
import { AgencyPhoneNumber, PhoneNumber } from '../../@types/prisonRegister'

describe('addPhoneNumberValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request
  const addPhoneNumber = jest.fn<Promise<AgencyPhoneNumber>, [PhoneNumber]>()
  const validForm: AddPhoneNumberForm = { phoneNumber: '0114 555 9898' }

  beforeEach(() => {
    jest.resetAllMocks()
    addPhoneNumber.mockResolvedValue({ id: 1, number: validForm.phoneNumber })
  })

  it('returns to court details page when valid', async () => {
    expect(await validate(validForm, req, addPhoneNumber)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each(['01145559898', '0114 555 9898', '+44 114-555-9898'])(
    'adds a phone number containing allowed characters: %s',
    async phoneNumber => {
      await validate({ phoneNumber }, req, addPhoneNumber)

      expect(addPhoneNumber).toHaveBeenCalledWith({ number: phoneNumber })
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('phoneNumber must be present', async () => {
    const form = {} as AddPhoneNumberForm

    expect(await validate(form, req, addPhoneNumber)).toEqual('/court-register/phone/create?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text: 'Enter a phone number' }])
    expect(addPhoneNumber).not.toHaveBeenCalled()
  })

  it.each(['', '   '])('phoneNumber must not be blank: %s', async phoneNumber => {
    expect(await validate({ phoneNumber }, req, addPhoneNumber)).toEqual('/court-register/phone/create?id=SHFCC')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text: 'Enter a phone number' }])
    expect(addPhoneNumber).not.toHaveBeenCalled()
  })

  it.each(['call 0114 555 9898', '0114/555/9898', '0114.555.9898', '(0114) 555 9898', '0114\t555', '0114\n555'])(
    'phoneNumber must not contain unsupported characters: %s',
    async phoneNumber => {
      expect(await validate({ phoneNumber }, req, addPhoneNumber)).toEqual('/court-register/phone/create?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#phoneNumber', text: 'Enter a phone number using only numbers, spaces, plus signs and dashes' },
      ])
      expect(addPhoneNumber).not.toHaveBeenCalled()
    },
  )

  it('propagates an error when adding the phone number fails', async () => {
    addPhoneNumber.mockRejectedValue(new Error('Server error'))

    await expect(validate(validForm, req, addPhoneNumber)).rejects.toThrow('Server error')
  })
})
