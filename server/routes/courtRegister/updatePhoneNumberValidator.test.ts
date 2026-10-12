import type { UpdatePhoneNumberForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updatePhoneNumberValidator'
import { AgencyPhoneNumber, PhoneNumber } from '../../@types/prisonRegister'

describe('updatePhoneNumberValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request
  const updatePhoneNumber = jest.fn<Promise<AgencyPhoneNumber>, [PhoneNumber]>()
  const validForm: UpdatePhoneNumberForm = { phoneNumber: '0114 555 9898', phoneId: 10000 }

  beforeEach(() => {
    jest.resetAllMocks()
    updatePhoneNumber.mockResolvedValue({ id: 10000, number: validForm.phoneNumber })
  })

  it('returns to court details with a success confirmation when valid', async () => {
    expect(await validate(validForm, req, updatePhoneNumber)).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
    expect(req.flash).not.toHaveBeenCalled()
  })

  it.each(['01145559898', '0114 555 9898', '+44 114-555-9898'])(
    'updates a phone number containing allowed characters: %s',
    async phoneNumber => {
      await validate({ ...validForm, phoneNumber }, req, updatePhoneNumber)

      expect(updatePhoneNumber).toHaveBeenCalledWith({ number: phoneNumber })
      expect(req.flash).not.toHaveBeenCalled()
    },
  )

  it('phoneNumber must be present', async () => {
    const form = { phoneId: 10000 } as UpdatePhoneNumberForm

    expect(await validate(form, req, updatePhoneNumber)).toEqual('/court-register/phone/update?id=SHFCC&phoneId=10000')
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text: 'Enter a phone number' }])
    expect(updatePhoneNumber).not.toHaveBeenCalled()
  })

  it.each(['', '   '])('phoneNumber must not be blank: %s', async phoneNumber => {
    expect(await validate({ ...validForm, phoneNumber }, req, updatePhoneNumber)).toEqual(
      '/court-register/phone/update?id=SHFCC&phoneId=10000',
    )
    expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#phoneNumber', text: 'Enter a phone number' }])
    expect(updatePhoneNumber).not.toHaveBeenCalled()
  })

  it.each(['call 0114 555 9898', '0114/555/9898', '0114.555.9898', '(0114) 555 9898', '0114\t555', '0114\n555'])(
    'phoneNumber must not contain unsupported characters: %s',
    async phoneNumber => {
      expect(await validate({ ...validForm, phoneNumber }, req, updatePhoneNumber)).toEqual(
        '/court-register/phone/update?id=SHFCC&phoneId=10000',
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#phoneNumber', text: 'Enter a phone number using only numbers, spaces, plus signs and dashes' },
      ])
      expect(updatePhoneNumber).not.toHaveBeenCalled()
    },
  )

  it('propagates an error when updating the phone number fails', async () => {
    updatePhoneNumber.mockRejectedValue(new Error('Server error'))

    await expect(validate(validForm, req, updatePhoneNumber)).rejects.toThrow('Server error')
  })
})
