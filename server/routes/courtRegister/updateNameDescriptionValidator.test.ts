import type { UpdateNameDescriptionForm } from 'agencyForms'
import { Request } from 'express'
import validate, { NameDescription } from './updateNameDescriptionValidator'
import type { CourtMutationResponse } from '../../services/prisonRegisterService'

describe('updateNameDescriptionValidator', () => {
  const req = {
    query: { id: 'SHFCC' },
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as unknown as Request

  const updateNameDescription = jest.fn<Promise<CourtMutationResponse>, [NameDescription]>()

  const validForm: UpdateNameDescriptionForm = {
    name: 'Sheffield Crown Court',
    description: 'Sheffield Main Crown Court',
  }

  describe('validate', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      updateNameDescription.mockResolvedValue({ success: true })
    })

    it('returns to court details page when valid', async () => {
      const nextPage = await validate(validForm, req, updateNameDescription)

      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it('updates the name and description when valid', async () => {
      await validate(validForm, req, updateNameDescription)

      expect(updateNameDescription).toHaveBeenCalledWith({
        name: 'Sheffield Crown Court',
        description: 'Sheffield Main Crown Court',
      })
    })

    it('flashes the API user message and returns to the form when updating fails', async () => {
      updateNameDescription.mockResolvedValue({ success: false, userMessage: 'Court name already in use' })

      expect(await validate(validForm, req, updateNameDescription)).toEqual(
        '/court-register/name-description/update?id=SHFCC',
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Court name already in use' }])
    })

    it('propagates unexpected API errors', async () => {
      updateNameDescription.mockRejectedValue(new Error('Server error'))

      await expect(validate(validForm, req, updateNameDescription)).rejects.toThrow('Server error')
      expect(req.flash).not.toHaveBeenCalled()
    })

    it.each([undefined, ''])('name must be present: %p', async name => {
      const form = { ...validForm, name } as unknown as UpdateNameDescriptionForm

      const nextPage = await validate(form, req, updateNameDescription)

      expect(nextPage).toEqual('/court-register/name-description/update?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#name', text: 'Enter a name' }])
      expect(updateNameDescription).not.toHaveBeenCalled()
    })

    it.each([undefined, ''])('description must be present: %p', async description => {
      const form = { ...validForm, description } as unknown as UpdateNameDescriptionForm

      const nextPage = await validate(form, req, updateNameDescription)

      expect(nextPage).toEqual('/court-register/name-description/update?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [{ href: '#description', text: 'Enter a description' }])
      expect(updateNameDescription).not.toHaveBeenCalled()
    })

    it('reports both errors when name and description are missing', async () => {
      const nextPage = await validate({ name: '', description: '' }, req, updateNameDescription)

      expect(nextPage).toEqual('/court-register/name-description/update?id=SHFCC')
      expect(req.flash).toHaveBeenCalledWith('errors', [
        { href: '#name', text: 'Enter a name' },
        { href: '#description', text: 'Enter a description' },
      ])
      expect(updateNameDescription).not.toHaveBeenCalled()
    })
  })
})
