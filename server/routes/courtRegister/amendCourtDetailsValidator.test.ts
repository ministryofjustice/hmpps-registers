import { AmendCourtDetailsForm } from 'forms'
import { Request } from 'express'
import validate from './amendCourtDetailsValidator'

jest.mock('../../services/courtRegisterService')

describe('amendCourtDetailsValidator', () => {
  const req = {
    flash: jest.fn() as (type: string, message: Array<Record<string, string>>) => number,
  } as Request

  const validForm: AmendCourtDetailsForm = {
    id: 'SHFCC',
    name: 'Sheffield Crown Court',
    type: 'CRN',
  }

  describe('validate', () => {
    let updateService: jest.Mocked<(id: string) => Promise<void>>
    beforeEach(() => {
      updateService = jest.fn().mockResolvedValue(null)
    })

    it('returns page to details page when valid', async () => {
      const form = { ...validForm }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(req.flash).toHaveBeenCalledTimes(0)
    })
    it('calls update service when valid', async () => {
      const form = { ...validForm, description: 'Sheffield Court' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/details?id=SHFCC&action=UPDATED')
      expect(updateService).toHaveBeenCalledWith(form.id, form.name, form.type, 'Sheffield Court')
    })
    it('name must not be a blank', async () => {
      const form = { ...validForm, name: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#name', text: 'Enter a court name' }])
    })
    it('name must be greater than 2 characters', async () => {
      const form = { ...validForm, name: 'A' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a court name between 2 and 200 characters' },
      ])
    })
    it('name must be less or equal to 200 characters', async () => {
      const form = { ...validForm, name: 'A'.repeat(201) }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-details')
      expect(req.flash).toBeCalledWith('errors', [
        { href: '#name', text: 'Enter a court name between 2 and 200 characters' },
      ])
    })
    it('type must not be selected', async () => {
      const form = { ...validForm, type: '  ' }
      const nextPage = await validate(form, req, updateService)
      expect(nextPage).toEqual('/court-register/amend-court-details')
      expect(req.flash).toBeCalledWith('errors', [{ href: '#type', text: 'Select a court type' }])
    })
  })
})
