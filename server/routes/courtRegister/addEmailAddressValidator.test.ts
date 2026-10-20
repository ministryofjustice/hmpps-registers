import type { AddEmailAddressForm } from 'agencyForms'
import { Request } from 'express'
import validate from './addEmailAddressValidator'
import { EmailAddress } from '../../@types/prisonRegister'
import type { CourtMutationResponse } from '../../services/hmppsAgencyRegisterApi'

describe('addEmailAddressValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const addEmailAddress = jest.fn<Promise<CourtMutationResponse>, [EmailAddress]>()

  const validForm: AddEmailAddressForm = {
    emailAddress: 'sheffield.court@example.com',
  }

  describe('validate', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      addEmailAddress.mockResolvedValue({ success: true })
    })

    it('returns to court details page when valid', async () => {
      const nextPage = await validate(validForm, req, addEmailAddress)

      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })

    it('adds the email address when valid', async () => {
      await validate(validForm, req, addEmailAddress)

      expect(addEmailAddress).toHaveBeenCalledWith({ address: 'sheffield.court@example.com' })
    })

    it('flashes the API user message and returns to the form when adding fails', async () => {
      addEmailAddress.mockResolvedValue({ success: false, userMessage: 'This email address already exists' })

      expect(await validate(validForm, req, addEmailAddress)).toEqual('/court-register/email/create?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#emailAddress', text: 'This email address already exists' },
      ])
    })

    it('propagates unexpected API errors', async () => {
      addEmailAddress.mockRejectedValue(new Error('Server error'))

      await expect(validate(validForm, req, addEmailAddress)).rejects.toThrow('Server error')
      expect(req.flash).not.toHaveBeenCalled()
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
