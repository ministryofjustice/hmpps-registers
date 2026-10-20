import type { UpdateEmailAddressForm } from 'agencyForms'
import { Request } from 'express'
import validate from './updateEmailAddressValidator'
import { UpdateEmailAddress } from '../../@types/prisonRegister'
import type { AgencyMutationResponse } from '../../services/hmppsAgencyRegisterApi'

describe('updateEmailAddressValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const updateEmailAddress = jest.fn<Promise<AgencyMutationResponse>, [UpdateEmailAddress]>()

  const validForm: UpdateEmailAddressForm = {
    emailAddress: 'sheffield.court@example.com',
    emailId: 10000,
  }

  describe('validate', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      updateEmailAddress.mockResolvedValue({ success: true })
    })

    it('returns to court details page when valid', async () => {
      const nextPage = await validate(validForm, req, updateEmailAddress)

      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })

    it('updates the email address when valid', async () => {
      await validate(validForm, req, updateEmailAddress)

      expect(updateEmailAddress).toHaveBeenCalledWith({ address: 'sheffield.court@example.com' })
    })

    it('flashes the API user message and returns to the selected email form when updating fails', async () => {
      updateEmailAddress.mockResolvedValue({ success: false, userMessage: 'This email address already exists' })

      expect(await validate(validForm, req, updateEmailAddress)).toEqual(
        '/court-register/email/update?id=SHFCC&emailId=10000',
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#emailAddress', text: 'This email address already exists' },
      ])
    })

    it('propagates unexpected API errors', async () => {
      updateEmailAddress.mockRejectedValue(new Error('Server error'))

      await expect(validate(validForm, req, updateEmailAddress)).rejects.toThrow('Server error')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('emailAddress must be present', async () => {
      const form = { ...validForm, emailAddress: undefined } as unknown as UpdateEmailAddressForm

      const nextPage = await validate(form, req, updateEmailAddress)

      expect(nextPage).toEqual('/court-register/email/update?id=SHFCC&emailId=10000')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(updateEmailAddress).not.toHaveBeenCalled()
    })

    it('emailAddress must not be blank', async () => {
      const form = { ...validForm, emailAddress: '' }

      const nextPage = await validate(form, req, updateEmailAddress)

      expect(nextPage).toEqual('/court-register/email/update?id=SHFCC&emailId=10000')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#emailAddress', text: 'Enter an email address' }])
      expect(updateEmailAddress).not.toHaveBeenCalled()
    })

    it.each(['sheffield.court', 'sheffield.court@', '@example.com', 'sheffield court@example.com'])(
      'emailAddress must be a valid email address: %s',
      async (emailAddress: string) => {
        const form = { ...validForm, emailAddress }

        const nextPage = await validate(form, req, updateEmailAddress)

        expect(nextPage).toEqual('/court-register/email/update?id=SHFCC&emailId=10000')
        expect(req.flash).toHaveBeenCalledWith('errors', [
          { href: '#emailAddress', text: 'Enter a valid email address' },
        ])
        expect(updateEmailAddress).not.toHaveBeenCalled()
      },
    )
  })
})
