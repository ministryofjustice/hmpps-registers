import type { AddEmailAddressForm } from 'prisonForms'
import { Request } from 'express'
import validate from './addEmailAddressValidator'
import { AgencyEmailAddress, EmailAddress } from '../../@types/prisonRegister'

describe('addEmailAddressValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const addEmailAddress = jest.fn<Promise<AgencyEmailAddress>, [EmailAddress]>()

  const validForm: AddEmailAddressForm = {
    emailAddress: 'sheffield.court@example.com',
  }

  describe('validate', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      addEmailAddress.mockResolvedValue({ id: 1, address: 'sheffield.court@example.com' })
    })

    it('returns to court details page when valid', async () => {
      const nextPage = await validate(validForm, req, addEmailAddress)

      expect(nextPage).toEqual('/court-register/details?id=SHFCC')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })

    it('adds the email address when valid', async () => {
      await validate(validForm, req, addEmailAddress)

      expect(addEmailAddress).toHaveBeenCalledWith({ address: 'sheffield.court@example.com' })
    })

    it('emailAddress must be present', async () => {
      const form = { emailAddress: undefined } as unknown as AddEmailAddressForm

      const nextPage = await validate(form, req, addEmailAddress)

      expect(nextPage).toEqual('/court-register/email/create?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(addEmailAddress).not.toHaveBeenCalled()
    })

    it('emailAddress must not be blank', async () => {
      const form = { ...validForm, emailAddress: '' }

      const nextPage = await validate(form, req, addEmailAddress)

      expect(nextPage).toEqual('/court-register/email/create?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(addEmailAddress).not.toHaveBeenCalled()
    })

    it.each(['sheffield.court', 'sheffield.court@', '@example.com', 'sheffield court@example.com'])(
      'emailAddress must be a valid email address: %s',
      async (emailAddress: string) => {
        const form = { ...validForm, emailAddress }

        const nextPage = await validate(form, req, addEmailAddress)

        expect(nextPage).toEqual('/court-register/email/create?id=SHFCC')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#emailAddress', text: 'Enter a valid email address' },
        ])
        expect(addEmailAddress).not.toHaveBeenCalled()
      },
    )
  })
})
