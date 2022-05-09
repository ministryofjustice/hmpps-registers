import type { AmendPrisonDetailsForm } from 'prisonForms'
import { Request } from 'express'
import validate from './amendPrisonDetailsValidator'

jest.mock('../../services/prisonRegisterService')

describe('amendPrisonDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AmendPrisonDetailsForm = {
    id: 'MDI',
    name: 'Moorland Prison',
    gender: ['male'],
    prisonTypes: ['HMP'],
    contracted: 'yes',
  }

  describe('validate', () => {
    let updateService: jest.Mocked<(id: string) => Promise<void>>
    beforeEach(() => {
      jest.resetAllMocks()
      updateService = jest.fn().mockResolvedValue(null)
    })

    it('returns page to details page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('calls update service when valid', async () => {
      const form = { ...validForm, name: 'Moorland Prison', gender: ['male'] }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/details?id=MDI&action=UPDATED')
      expect(updateService).toHaveBeenCalledWith(form.id, form.name, form.gender, form.prisonTypes)
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a prison name' }])
    })
    it('name must be greater than 3 characters', async () => {
      const form = { ...validForm, name: 'AA' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 80 characters' },
      ])
    })
    it('name must be less or equal to 80 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(81) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/prison-register/amend-prison-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a prison name between 3 and 80 characters' },
      ])
    })
  })
})
